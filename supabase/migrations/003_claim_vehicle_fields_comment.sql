-- BAZOOCLAIMS — claim payload: vehicle make/model fields (stored in claims.payload JSONB).
-- No ALTER required: AdminClaim JSON already lives in payload. This migration documents the shape for DBAs and mirrors.

comment on table public.claims is
  'Mirror: claims[]; payload = full AdminClaim JSON (includes vehicleRegistration, optional vehicleMakeModel, thirdPartyDetails, thirdPartyVehicleMakeModel, etc.).';
