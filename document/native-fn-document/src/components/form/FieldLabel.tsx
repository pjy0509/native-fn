import styled from "styled-components";

const FieldLabel = styled.label`
    display: block;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: ${({theme}) => theme.colors.textMuted};
    margin-bottom: 0.375rem;
    user-select: none;
`;

export default FieldLabel;
