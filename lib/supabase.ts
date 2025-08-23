// Simple supabase stub for demo purposes
// TODO: Replace with actual Supabase configuration when ready

export const supabase = {
  from: (table: string) => ({
    select: (columns: string, options?: any) => ({
      eq: (column: string, value: any) => ({
        range: (from: number, to: number) => ({
          order: (column: string, options: any) => ({
            async then(callback: any) {
              // Return demo data for now
              return callback({ 
                data: [], 
                error: new Error('Database not configured'), 
                count: 0 
              })
            }
          })
        }),
        async then(callback: any) {
          return callback({ 
            data: [], 
            error: new Error('Database not configured'), 
            count: 0 
          })
        }
      }),
      range: (from: number, to: number) => ({
        order: (column: string, options: any) => ({
          async then(callback: any) {
            return callback({ 
              data: [], 
              error: new Error('Database not configured'), 
              count: 0 
            })
          }
        })
      }),
      order: (column: string, options: any) => ({
        async then(callback: any) {
          return callback({ 
            data: [], 
            error: new Error('Database not configured'), 
            count: 0 
          })
        }
      })
    })
  })
}