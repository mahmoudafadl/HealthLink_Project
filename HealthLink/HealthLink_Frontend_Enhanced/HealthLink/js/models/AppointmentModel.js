/* ============================================================
   HEALTHLINK — APPOINTMENT MODEL
   Defines the shape of an Appointment entity.

   Patient Appointment {
     id:      number,
     doctor:  string,
     spec:    string,
     date:    string,
     time:    string,
     type:    'In-Clinic' | 'Video' | 'Home Visit',
     status:  'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
   }

   Doctor Appointment {
     patient: string,
     age:     number,
     reason:  string,
     time:    string,
     status:  'Pending' | 'In Progress' | 'Completed'
   }
============================================================ */
