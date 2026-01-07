export const CarConstants = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_PAGE: 0,
  PAGE_SIZE_OPTIONS: [10, 20, 50] as readonly number[],
  
  // Sorting
  DEFAULT_SORT_FIELD: 'model' as string,
  DEFAULT_SORT_DIRECTION: 'asc' as string,
  DEFAULT_SORT: 'model,asc' as string,
  
  // Debouncing
  DEBOUNCE_TIME_MS: 300,
  
  // Field validation limits
  FIELD_MAX_LENGTH: 100,
  PRODUCTION_YEAR_MIN: 1,
  get PRODUCTION_YEAR_MAX() {
    return new Date().getFullYear();
  },
  PRICE_MIN: 0.01,
  PRICE_MAX: 99999999.99,
  
  // Inline create defaults
  INLINE_CREATE_DEFAULT_YEAR: 1,
  INLINE_CREATE_DEFAULT_PRICE: 0.01,
  
  // Special IDs
  NEW_ROW_ID: '__new__',
};

