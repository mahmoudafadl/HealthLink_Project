/* ============================================================
   HEALTHLINK — PATIENT MODEL
   Defines the shape of a Patient entity.

   Patient {
     id:        string,   // e.g. "P001"
     name:      string,
     age:       number,
     condition: string,
     last:      string,   // Last visit date
     next:      string    // Next appointment date
   }

   MedicalHistory {
     date:      string,
     doctor:    string,
     condition: string,
     notes:     string
   }

   Prescription {
     drug:   string,
     dose:   string,
     by:     string,   // Doctor name
     since:  string
   }

   HomeServiceRequest {
     id:      number,
     service: string,
     date:    string,
     time:    string,
     address: string,
     status:  'Pending' | 'In Progress' | 'Completed',
     nurse:   string
   }

   Feedback {
     id:      number,
     patient: string,
     target:  string,
     rating:  number,
     text:    string,
     date:    string,
     isNew:   boolean
   }
============================================================ */
