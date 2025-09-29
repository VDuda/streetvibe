import { z } from 'zod';

export const ServiceRequestSchema = z.object({
  _id: z.number(),
  case_enquiry_id: z.string(),
  open_dt: z.string().nullable(),
  sla_target_dt: z.string().nullable(),
  closed_dt: z.string().nullable(),
  on_time: z.string(),
  case_status: z.string(),
  closure_reason: z.string(),
  case_title: z.string(),
  subject: z.string(),
  reason: z.string(),
  type: z.string(),
  queue: z.string(),
  department: z.string(),
  submitted_photo: z.string().nullable(),
  closed_photo: z.string().nullable(),
  location: z.string(),
  fire_district: z.string().nullable(),
  pwd_district: z.string().nullable(),
  city_council_district: z.string().nullable(),
  police_district: z.string().nullable(),
  neighborhood: z.string().nullable(),
  neighborhood_services_district: z.string().nullable(),
  ward: z.string().nullable(),
  precinct: z.string().nullable(),
  location_street_name: z.string().nullable(),
  location_zipcode: z.string().nullable(),
  latitude: z.string(),
  longitude: z.string(),
  geom_4326: z.string(),
  source: z.string(),
});

export type ServiceRequest = z.infer<typeof ServiceRequestSchema>;

// Removed CkanResponseSchema since we're using CSV directly
