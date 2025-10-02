# 🚀 Elasticsearch Migration & Multi-City Support

## Overview
Migrate from static CSV data loading to real-time Elasticsearch-based architecture to support streaming 311 data from multiple cities (Boston, Cambridge, future sources).

## Goals
- **Sub 20-100ms queries** with geospatial filtering
- **Real-time streaming** updates via Elasticsearch
- **Multi-city support** (Boston + Cambridge + future expansion)
- **Kubernetes deployment** for scalability

---

## 📋 Implementation Tasks

### Phase 1: Elasticsearch Infrastructure (Priority: High)

#### ✅ 1.1 Kubernetes Elasticsearch Deployment
```yaml
# k8s/elasticsearch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: elasticsearch
  labels:
    app: elasticsearch
spec:
  replicas: 1
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      labels:
        app: elasticsearch
    spec:
      containers:
      - name: elasticsearch
        image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
        env:
        - name: discovery.type
          value: "single-node"
        - name: ES_JAVA_OPTS
          value: "-Xms2g -Xmx2g"
        - name: xpack.security.enabled
          value: "false"
        ports:
        - containerPort: 9200
        resources:
          requests:
            memory: "4Gi"
            cpu: "1"
          limits:
            memory: "4Gi"
            cpu: "2"
        volumeMounts:
        - name: es-data
          mountPath: /usr/share/elasticsearch/data
      volumes:
      - name: es-data
        persistentVolumeClaim:
          claimName: elasticsearch-pvc
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: elasticsearch-pvc
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: elasticsearch
spec:
  selector:
    app: elasticsearch
  ports:
  - port: 9200
    targetPort: 9200
  type: ClusterIP
```

#### ✅ 1.2 Index Creation & Schema
```typescript
// scripts/setup-elasticsearch.ts
const indexSettings = {
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "external_id": { "type": "keyword" },
      "source": { "type": "keyword" },
      "location": { "type": "geo_point" },
      "title": { "type": "text" },
      "description": { "type": "text" },
      "status": { "type": "keyword" },
      "type": { "type": "keyword" },
      "department": { "type": "keyword" },
      "neighborhood": { "type": "keyword" },
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" },
      "closed_at": { "type": "date" },
      "photos": {
        "type": "object",
        "properties": {
          "submitted": { "type": "keyword" },
          "closed": { "type": "keyword" }
        }
      }
    }
  }
};
```

### Phase 2: Data Ingestion Pipeline (Priority: High)

#### ✅ 2.1 Data Ingestion CronJob
```yaml
# k8s/data-ingester.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: data-ingester
spec:
  schedule: "*/15 * * * *"  # Every 15 minutes
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: ingester
            image: node:18-alpine
            command: ["/bin/sh"]
            args:
              - -c
              - |
                npm install @elastic/elasticsearch node-fetch
                node /app/ingest-311-data.js
            env:
            - name: ELASTICSEARCH_URL
              value: "http://elasticsearch:9200"
            - name: BOSTON_311_API
              value: "https://data.boston.gov/api/3/action/datastore_search"
            - name: CAMBRIDGE_311_API
              value: "https://data.cambridgema.gov/api/311"
            volumeMounts:
            - name: ingester-script
              mountPath: /app
          volumes:
          - name: ingester-script
            configMap:
              name: ingester-script
          restartPolicy: OnFailure
```

#### ✅ 2.2 Data Normalization Script
```typescript
// scripts/ingest-311-data.js
interface NormalizedServiceRequest {
  id: string;
  external_id: string;
  source: 'boston' | 'cambridge';
  location: {
    lat: number;
    lon: number;
  };
  title: string;
  description?: string;
  status: 'open' | 'closed' | 'in_progress';
  type: string;
  department: string;
  neighborhood?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  photos: {
    submitted?: string;
    closed?: string;
  };
}

const normalizeData = (rawData: any[], source: string): NormalizedServiceRequest[] => {
  // Implementation varies by city API format
  return rawData.map(item => ({
    id: `${source}-${item.id}`,
    external_id: item.case_enquiry_id || item.id,
    source,
    location: {
      lat: parseFloat(item.latitude),
      lon: parseFloat(item.longitude)
    },
    title: item.case_title || item.title,
    description: item.subject || item.description,
    status: mapStatus(item.case_status || item.status),
    type: item.type || item.request_type,
    department: item.department,
    neighborhood: item.neighborhood,
    created_at: item.open_dt || item.created_at,
    updated_at: item.updated_at || item.open_dt,
    closed_at: item.closed_dt,
    photos: {
      submitted: item.submitted_photo,
      closed: item.closed_photo
    }
  }));
};
```

### Phase 3: Frontend Migration (Priority: Medium)

#### ✅ 3.1 Replace CSV Hook with Elasticsearch
```typescript
// src/hooks/use-311-data.ts
import { useQuery } from '@tanstack/react-query';

interface SearchParams {
  bounds?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  sources?: string[];
  limit?: number;
  offset?: number;
}

const search311Data = async (params: SearchParams) => {
  const query = {
    query: {
      bool: {
        filter: [
          ...(params.bounds ? [{
            geo_bounding_box: {
              location: {
                top_left: { lat: params.bounds[3], lon: params.bounds[0] },
                bottom_right: { lat: params.bounds[1], lon: params.bounds[2] }
              }
            }
          }] : []),
          ...(params.sources ? [{
            terms: { source: params.sources }
          }] : [])
        ]
      }
    },
    sort: [{ created_at: { order: 'desc' } }],
    size: params.limit || 100,
    from: params.offset || 0
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_ELASTICSEARCH_URL}/service_requests/_search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query)
  });

  const { hits } = await response.json();
  return hits.hits.map((hit: any) => hit._source);
};

export const use311Data = (params: SearchParams = {}) => {
  return useQuery({
    queryKey: ['311-data', params],
    queryFn: () => search311Data(params),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 15000 // Consider data stale after 15 seconds
  });
};
```

#### ✅ 3.2 Viewport-based Map Queries
```typescript
// src/components/Map.tsx
const Map = () => {
  const [viewState, setViewState] = useState({
    longitude: -71.0589,
    latitude: 42.3601,
    zoom: 11
  });

  // Calculate bounds from viewport
  const bounds = useMemo(() => {
    if (!mapRef.current) return undefined;
    const map = mapRef.current.getMap();
    const bounds = map.getBounds();
    return [
      bounds.getWest(),
      bounds.getSouth(), 
      bounds.getEast(),
      bounds.getNorth()
    ] as [number, number, number, number];
  }, [viewState]);

  // Only fetch data for current viewport
  const { data: serviceRequests } = use311Data({ 
    bounds,
    sources: ['boston', 'cambridge'],
    limit: 500 
  });

  // Rest of component...
};
```

#### ✅ 3.3 Multi-City Filter Component
```typescript
// src/components/CityFilter.tsx
export const CityFilter = ({ 
  selectedCities, 
  onCitiesChange 
}: {
  selectedCities: string[];
  onCitiesChange: (cities: string[]) => void;
}) => {
  const cities = [
    { id: 'boston', name: 'Boston', color: '#FF6B6B' },
    { id: 'cambridge', name: 'Cambridge', color: '#4ECDC4' }
  ];

  return (
    <div className="flex gap-2 p-4">
      {cities.map(city => (
        <button
          key={city.id}
          onClick={() => {
            const newCities = selectedCities.includes(city.id)
              ? selectedCities.filter(c => c !== city.id)
              : [...selectedCities, city.id];
            onCitiesChange(newCities);
          }}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            selectedCities.includes(city.id)
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          style={{ 
            backgroundColor: selectedCities.includes(city.id) ? city.color : undefined 
          }}
        >
          {city.name}
        </button>
      ))}
    </div>
  );
};
```

### Phase 4: Real-time Updates (Priority: Low)

#### ✅ 4.1 WebSocket Integration (Future Enhancement)
```typescript
// src/hooks/use-realtime-updates.ts
export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['311-data'] });
      
      // Optionally update cache directly for instant UI updates
      queryClient.setQueriesData(
        { queryKey: ['311-data'] },
        (oldData: any) => {
          if (!oldData) return oldData;
          return [update, ...oldData.slice(0, 99)];
        }
      );
    };

    return () => ws.close();
  }, [queryClient]);
};
```

---

## 🎯 Success Metrics

### Performance Goals
- [ ] **Query Response Time**: < 100ms for viewport-based searches
- [ ] **Initial Load Time**: < 2 seconds for first 100 records
- [ ] **Memory Usage**: < 4GB for Elasticsearch pod
- [ ] **Data Freshness**: Updates within 15 minutes of source

### Feature Goals
- [ ] **Multi-city Support**: Boston + Cambridge data visible simultaneously
- [ ] **Geospatial Queries**: Efficient viewport-based filtering
- [ ] **Real-time Updates**: New requests appear without page refresh
- [ ] **Scalability**: Support for 100K+ records without performance degradation

---

## 🔧 Deployment Instructions

### Prerequisites
```bash
# Ensure you have kubectl configured for your k8s cluster
kubectl cluster-info

# Create namespace (optional)
kubectl create namespace streetvibe
```

### Deployment Steps
```bash
# 1. Deploy Elasticsearch
kubectl apply -f k8s/elasticsearch.yaml

# 2. Wait for Elasticsearch to be ready
kubectl wait --for=condition=ready pod -l app=elasticsearch --timeout=300s

# 3. Create index and setup schema
kubectl port-forward svc/elasticsearch 9200:9200 &
node scripts/setup-elasticsearch.ts
kill %1  # Stop port-forward

# 4. Deploy data ingestion pipeline
kubectl apply -f k8s/data-ingester.yaml

# 5. Update frontend environment variables
echo "NEXT_PUBLIC_ELASTICSEARCH_URL=http://elasticsearch:9200" >> .env.local

# 6. Deploy frontend (your existing k8s manifests)
kubectl apply -f k8s/frontend.yaml
```

### Verification
```bash
# Check Elasticsearch health
kubectl exec -it deployment/elasticsearch -- curl localhost:9200/_cluster/health

# Check data ingestion logs
kubectl logs -f job/data-ingester-$(date +%s)

# Test API queries
curl "http://elasticsearch:9200/service_requests/_search?size=1"
```

---

## 🐛 Troubleshooting

### Common Issues
1. **Elasticsearch OOM**: Increase memory limits or reduce heap size
2. **Index corruption**: Delete and recreate index
3. **Slow queries**: Add more specific filters, check index mappings
4. **Data sync issues**: Check CronJob logs and API endpoints

### Monitoring
```bash
# Check Elasticsearch cluster stats
kubectl exec -it deployment/elasticsearch -- curl localhost:9200/_cluster/stats

# Monitor resource usage
kubectl top pods

# Check ingestion job history
kubectl get jobs
```

---

## 📚 Next Steps

### Future Enhancements
- [ ] Add more cities (Somerville, Brookline, etc.)
- [ ] Implement data aggregations (charts, statistics)
- [ ] Add full-text search capabilities
- [ ] Implement user favorites/bookmarks
- [ ] Add mobile-optimized PWA features
- [ ] Implement email/SMS alerts for new requests in specific areas

### Technical Debt
- [ ] Add comprehensive error handling
- [ ] Implement rate limiting for API calls
- [ ] Add automated testing for data pipeline
- [ ] Setup monitoring and alerting
- [ ] Document API schemas and endpoints