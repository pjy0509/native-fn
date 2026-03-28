import styled from "styled-components";
import {fadeIn} from "../../styled/keyframes";

const Field = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 1.25rem;
    animation: ${fadeIn} 0.3s ease;
`;

export default Field;
