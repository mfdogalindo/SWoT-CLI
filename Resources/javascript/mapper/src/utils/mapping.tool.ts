
export class SemanticMappingTools {
   static sanitizeId(id: string): string {
      return id.replace(/[^a-zA-Z0-9]/g, '_');
   }

   static createTimestamp(timestamp: number): string {
      const date = new Date(timestamp);
      return date.toISOString();
    }
}