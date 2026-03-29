import styled from "styled-components";

export interface DividerProps {
    marginY?: string;
    marginX?: string;
}

const Divider = styled.hr<DividerProps>`
    border: none;
    border-top: 1px solid ${({theme}) => theme.colors.border};
    margin: ${({marginY = "0.75rem"}) => marginY} ${({marginX = "0"}) => marginX};
    opacity: 0.7;
`;

export default Divider;
