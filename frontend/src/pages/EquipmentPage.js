import React from 'react';
import CrudPage from '../components/CrudPage';
import { equipmentApi } from '../services/api';

export default function EquipmentPage() {
  return (
    <CrudPage
      title="Equipment"
      subtitle="Scanners, ballot marking devices, ePollbooks and ADA audio units."
      api={equipmentApi}
      statusKey="status"
      fields={[
        { key: 'eq_id',            label: 'Equipment ID' },
        { key: 'type',             label: 'Type', type: 'select', options: ['ballot_scanner','ballot_marking','epollbook_tablet','ada_audio_unit'] },
        { key: 'sn',               label: 'Serial #' },
        { key: 'precinct_id',      label: 'Precinct ID' },
        { key: 'status',           label: 'Status', type: 'select', options: ['ready','needs_service','offline'] },
        { key: 'last_calibration', label: 'Last Calibration', type: 'date' },
        { key: 'notes',            label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
