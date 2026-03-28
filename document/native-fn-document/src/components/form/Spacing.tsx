import styled from "styled-components";

export interface SpacingProps {
    height?: string;
}

const Spacing = styled.div<SpacingProps>`
    height: ${({height = "2rem"}) => height};
`;

export default Spacing;
