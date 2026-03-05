import { Ionicons } from '@expo/vector-icons'
import { withUniwind } from 'uniwind'

export const Icon = withUniwind(Ionicons)

export type IconName = React.ComponentProps<typeof Ionicons>['name']
