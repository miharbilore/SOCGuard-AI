import { DetectionCategory } from '../types';

export type TransformType = 
  | 'ORIGINAL'
  | 'LOWERCASE'
  | 'UPPERCASE'
  | 'URL_ENCODED'
  | 'HTML_ENTITY_ENCODED'
  | 'ZERO_WIDTH_OBFUSCATED'
  | 'TURKISH_EQUIVALENT'
  | 'SPACING_OBFUSCATED';

export interface AttackVariant {
  id: string;
  basePhrase: string;
  variant: string;
  transformType: TransformType;
  expectedCategory: DetectionCategory;
  notes?: string;
}
