/** Public data module for the digital library — mock vs real by `USE_MOCKS`. */
import { USE_MOCKS } from '@/api/config';
import * as mock from '@/features/library/mock';
import * as remote from '@/features/library/api';

export const fetchMaterials = USE_MOCKS
  ? mock.fetchMaterials
  : remote.fetchMaterials;
export const fetchMaterialCategories = USE_MOCKS
  ? mock.fetchMaterialCategories
  : remote.fetchMaterialCategories;
export const createMaterial = USE_MOCKS
  ? mock.createMaterial
  : remote.createMaterial;
export const updateMaterial = USE_MOCKS
  ? mock.updateMaterial
  : remote.updateMaterial;
export const deleteMaterial = USE_MOCKS
  ? mock.deleteMaterial
  : remote.deleteMaterial;
export const createMaterialCategory = USE_MOCKS
  ? mock.createMaterialCategory
  : remote.createMaterialCategory;
export const updateMaterialCategory = USE_MOCKS
  ? mock.updateMaterialCategory
  : remote.updateMaterialCategory;
export const deleteMaterialCategory = USE_MOCKS
  ? mock.deleteMaterialCategory
  : remote.deleteMaterialCategory;
export const uploadMaterialFile = USE_MOCKS
  ? mock.uploadMaterialFile
  : remote.uploadMaterialFile;
