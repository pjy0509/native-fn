import styled from "styled-components";

const Row = styled.div.withConfig({shouldForwardProp: (prop) => prop !== "gap",})<{ gap?: string }>`
    display: flex;
    align-items: center;
    gap: ${({gap = "0.75rem"}) => gap};
    flex-wrap: wrap;
`;

export default Row;
