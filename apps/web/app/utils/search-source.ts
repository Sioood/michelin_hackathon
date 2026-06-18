import type { SearchSource } from '~/types/search'

import { assertNever } from '~nuxt-essentials/app/utils/assert-never'

export interface SearchSourcePresentation {
  icon: string
  intent: 'neutral' | 'success' | 'warning'
  label: string
  title: string
}

export function getSearchSourcePresentation(source: SearchSource): SearchSourcePresentation {
  switch (source) {
    case 'mistral':
      return {
        icon: 'tabler:sparkles',
        intent: 'success',
        label: 'Généré avec Mistral',
        title: 'Réponse générée avec Mistral',
      }
    case 'heuristic':
      return {
        icon: 'tabler:adjustments-horizontal',
        intent: 'warning',
        label: 'Recherche locale sans IA',
        title: 'Mistral indisponible — résultat local',
      }
    case 'questionnaire':
      return {
        icon: 'tabler:clipboard-list',
        intent: 'neutral',
        label: 'Questionnaire sans IA',
        title: 'Résultat calculé depuis vos réponses',
      }
    default:
      return assertNever(source)
  }
}
