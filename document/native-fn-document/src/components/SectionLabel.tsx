import styled from "styled-components";

const SectionLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 2rem 0 1.125rem;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: ${({theme}) => theme.colors.textMuted};

    &::before, &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: ${({theme}) => theme.colors.border};
        opacity: 0.7;
    }
`;

export default SectionLabel;
