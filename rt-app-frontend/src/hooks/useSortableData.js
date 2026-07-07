import { useState, useMemo } from 'react';

export const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle nested properties like 'house.house_number'
        if (sortConfig.key.includes('.')) {
          const keys = sortConfig.key.split('.');
          aValue = keys.reduce((obj, key) => (obj || {})[key], a);
          bValue = keys.reduce((obj, key) => (obj || {})[key], b);
        }

        // Handle numeric strings vs text
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';
        
        // Try parsing to numbers for proper numeric sorting
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum) && aValue !== '' && bValue !== '') {
          if (aNum < bNum) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (aNum > bNum) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        }

        // Default string sorting (Natural Sort for cases like 'A1', 'A10', 'A2')
        const compareResult = aValue.toString().localeCompare(
          bValue.toString(), 
          undefined, 
          { numeric: true, sensitivity: 'base' }
        );
        
        return sortConfig.direction === 'ascending' ? compareResult : -compareResult;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};
