import type { RouteRecordRaw } from 'vue-router'
import ExportWithSourcePdf from './ExportWithSourcePdf.vue'

export default function setupExporterRoutes(routes: RouteRecordRaw[]) {
  const route = routes.find(r => r.name === 'export')
  if (route)
    route.component = ExportWithSourcePdf
  return routes
}
