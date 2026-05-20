import React from 'react';
import CrudPage from '../components/CrudPage';
import { vehiclesApi } from '../services/api';

export default function VehiclesPage() {
  return (
    <CrudPage
      title="Vehicles"
      subtitle="Cargo vans, panel trucks and sedans for courier runs."
      api={vehiclesApi}
      statusKey="status"
      fields={[
        { key: 'vehicle_id',  label: 'Vehicle ID' },
        { key: 'type',        label: 'Type', type: 'select', options: ['cargo_van','panel_truck','sedan','minivan'] },
        { key: 'plate',       label: 'Plate' },
        { key: 'fuel_status', label: 'Fuel Status' },
        { key: 'location',    label: 'Location' },
        { key: 'status',      label: 'Status', type: 'select', options: ['available','en_route','on_site','maintenance'] },
        { key: 'notes',       label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
