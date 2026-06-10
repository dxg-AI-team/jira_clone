import styled from 'styled-components';

import { color, font } from 'shared/utils/styles';

export const Page = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 25px;
  background: ${color.backgroundLightest};
`;

export const Panel = styled.div`
  width: 100%;
  max-width: 380px;
  padding: 40px;
  text-align: center;
  background: #fff;
  border-radius: 6px;
  box-shadow: rgba(9, 30, 66, 0.13) 0px 0px 1px, rgba(9, 30, 66, 0.13) 0px 4px 8px -2px;
`;

export const Title = styled.h1`
  ${font.bold}
  ${font.size(24)}
  color: ${color.textDark};
`;

export const Subtitle = styled.p`
  margin-top: 8px;
  margin-bottom: 28px;
  ${font.regular}
  ${font.size(15)}
  color: ${color.textMedium};
`;

export const GoogleButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export const Note = styled.p`
  margin-top: 20px;
  ${font.size(13)}
  color: ${color.textMedium};
`;
