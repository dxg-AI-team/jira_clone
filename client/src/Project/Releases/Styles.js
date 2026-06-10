import styled from 'styled-components';

import { color, font } from 'shared/utils/styles';
import Button from 'shared/components/Button';
import Form from 'shared/components/Form';

export const Page = styled.div`
  padding: 25px 32px 50px;
  width: 100%;
  max-width: 1000px;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

export const Title = styled.h1`
  ${font.bold}
  ${font.size(24)}
  color: ${color.textDark};
`;

export const Empty = styled.div`
  padding: 40px;
  text-align: center;
  ${font.size(15)}
  color: ${color.textMedium};
  border: 1px dashed ${color.borderLight};
  border-radius: 4px;
`;

export const VersionList = styled.div`
  border: 1px solid ${color.borderLightest};
  border-radius: 4px;
`;

export const VersionRow = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 18px;
  &:not(:last-of-type) {
    border-bottom: 1px solid ${color.borderLightest};
  }
`;

export const VersionMain = styled.div`
  flex: 1;
  min-width: 0;
`;

export const VersionNameRow = styled.div`
  display: flex;
  align-items: center;
`;

export const VersionName = styled.div`
  ${font.medium}
  ${font.size(16)}
  color: ${color.textDark};
`;

export const ReleasedBadge = styled.span`
  margin-left: 10px;
  padding: 2px 9px;
  border-radius: 4px;
  ${font.medium}
  ${font.size(12)}
  color: #fff;
  background: ${color.success};
`;

export const VersionDate = styled.div`
  margin-top: 3px;
  ${font.size(13)}
  color: ${color.textMedium};
`;

export const Progress = styled.div`
  width: 260px;
  margin: 0 24px;
`;

export const ProgressText = styled.div`
  margin-bottom: 5px;
  ${font.size(12.5)}
  color: ${color.textMedium};
`;

export const ProgressBar = styled.div`
  height: 8px;
  border-radius: 4px;
  background: ${color.backgroundMedium};
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  border-radius: 4px;
  background: ${color.success};
  width: ${props => props.percent}%;
  transition: width 0.2s;
`;

export const RowActions = styled.div`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 6px;
  }
`;

export const FormHeading = styled.h1`
  padding-bottom: 15px;
  ${font.medium}
  ${font.size(21)}
  color: ${color.textDark};
`;

export const FormElement = styled(Form.Element)`
  padding: 5px 0 20px;
`;

export const Actions = styled.div`
  display: flex;
  padding-top: 28px;
`;

export const ActionButton = styled(Button)`
  margin-right: 10px;
`;
