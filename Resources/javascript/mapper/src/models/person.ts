export interface Person {
   id: string;
   type: 'resident' | 'nurse' | 'staff';
   name: string;
   preferredTemp?: number; // temperatura preferida en Celsius
   room?: string; // para residentes
   active: boolean;
   createdAt: Date;
   updatedAt: Date;
}