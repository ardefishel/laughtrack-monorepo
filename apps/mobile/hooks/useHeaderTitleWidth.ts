import { createContext, useContext } from 'react';

export const HeaderTitleWidthContext = createContext<number>(0);

export function useHeaderTitleWidth() {
    return useContext(HeaderTitleWidthContext);
}
