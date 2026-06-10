import styled from 'styled-components';

import { color, font, mixin } from 'shared/utils/styles';
import Button from 'shared/components/Button';

export const Page = styled.div`
  padding: 25px 32px 60px;
  width: 100%;
  max-width: 900px;
`;

export const Title = styled.h1`
  ${font.bold}
  ${font.size(24)}
  color: ${color.textDark};
`;

export const Intro = styled.p`
  margin: 8px 0 22px;
  ${font.size(14.5)}
  color: ${color.textMedium};
  line-height: 1.5;
`;

export const FileRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  > * + * {
    margin-left: 14px;
  }
`;

export const FileButton = styled.label`
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
  background: ${color.primary};
  ${font.size(14.5)}
  ${font.medium}
  input {
    display: none;
  }
`;

export const FileName = styled.div`
  ${font.size(14)}
  color: ${color.textMedium};
`;

export const Section = styled.div`
  padding: 18px 20px;
  margin-bottom: 18px;
  border: 1px solid ${color.borderLightest};
  border-radius: 6px;
  background: #fff;
`;

export const SectionTitle = styled.div`
  margin-bottom: 12px;
  ${font.medium}
  ${font.size(16)}
  color: ${color.textDark};
`;

export const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Chip = styled.span`
  padding: 3px 10px;
  border-radius: 4px;
  ${font.size(12.5)}
  color: ${color.textDark};
  background: ${color.backgroundLight};
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 7px 0;
  ${font.size(13.5)}
  &:not(:last-of-type) {
    border-bottom: 1px solid ${color.borderLightest};
  }
`;

export const RowTitle = styled.div`
  flex: 1;
  min-width: 0;
  margin-right: 12px;
  color: ${color.textDark};
  ${mixin.truncateText}
`;

export const RowMeta = styled.div`
  flex-shrink: 0;
  color: ${color.textMedium};
`;

export const Warning = styled.div`
  margin-top: 10px;
  ${font.size(13)}
  color: #b75c00;
`;

export const ImportButton = styled(Button)`
  margin-top: 6px;
`;

export const Result = styled.div`
  padding: 16px 20px;
  margin-top: 18px;
  border-radius: 6px;
  background: ${color.backgroundLightest};
  ${font.size(14)}
  color: ${color.textDark};
  line-height: 1.7;
`;
