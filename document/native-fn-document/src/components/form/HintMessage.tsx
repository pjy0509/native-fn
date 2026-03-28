import styled from "styled-components";

const HintMessage = styled.p`
    font-size: 0.6875rem;
    color: ${({theme}) => theme.colors.textMuted};
    margin-top: 0.3125rem;
    opacity: 0.8;
`;

export default HintMessage;
