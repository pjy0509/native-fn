import styled from "styled-components";

interface GridProps {
    cols?: number;
    gap?: string;
}

const Grid = styled.div.withConfig({shouldForwardProp: (prop: string) => !["cols", "gap"].includes(prop),})<GridProps>`
    display: grid;
    grid-template-columns: repeat(${({cols = 1}) => cols}, 1fr);
    gap: ${({gap = "1.25rem"}) => gap};

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
    }
`;

export default Grid;
