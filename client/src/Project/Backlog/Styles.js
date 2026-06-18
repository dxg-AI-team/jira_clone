import styled from 'styled-components';

import { color, font } from 'shared/utils/styles';
import Button from 'shared/components/Button';
import Form from 'shared/components/Form';

export const Page = styled.div`
  padding: 25px 32px 50px;
  width: 100%;
  max-width: 1100px;
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

export const SprintCard = styled.div`
  margin-bottom: 18px;
  border: 1px solid ${color.borderLightest};
  border-radius: 5px;
  background: ${color.backgroundLightest};
`;

export const SprintHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 13px 16px;
  border-bottom: 1px solid ${color.borderLightest};
  background: ${color.backgroundLight};
  border-radius: 5px 5px 0 0;
`;

export const SprintHeaderMain = styled.div`
  flex: 1;
  min-width: 0;
`;

export const SprintTitleRow = styled.div`
  display: flex;
  align-items: center;
`;

export const SprintName = styled.div`
  ${font.medium}
  ${font.size(16)}
  color: ${color.textDark};
`;

export const StatusBadge = styled.span`
  margin-left: 10px;
  padding: 2px 9px;
  border-radius: 4px;
  ${font.medium}
  ${font.size(12)}
  color: #fff;
  background: ${props => props.bg || color.textMedium};
`;

export const SprintMeta = styled.div`
  margin-top: 3px;
  ${font.size(13)}
  color: ${color.textMedium};
`;

export const SprintActions = styled.div`
  display: flex;
  align-items: center;
  > * + * {
    margin-left: 6px;
  }
`;

export const IssueList = styled.div`
  padding: 4px 0;
  min-height: 36px;
`;

export const BacklogSection = styled.div`
  margin-top: 26px;
`;

export const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  ${font.medium}
  ${font.size(15)}
  color: ${color.textDark};
`;

export const IssueRow = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  ${font.size(14.5)}
  color: ${color.textDarkest};
  &:hover {
    background: ${color.backgroundLight};
  }
`;

export const IssueKey = styled.span`
  flex-shrink: 0;
  margin-left: 10px;
  ${font.size(13)}
  ${font.medium}
  color: ${color.textMedium};
  white-space: nowrap;
`;

export const IssueTitle = styled.div`
  flex: 1;
  min-width: 0;
  margin: 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

export const Points = styled.span`
  margin-right: 12px;
  min-width: 24px;
  height: 22px;
  padding: 0 7px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  ${font.bold}
  ${font.size(12.5)}
  color: ${color.textMedium};
  background: ${color.backgroundMedium};
`;

export const MoveSelect = styled.div`
  width: 190px;
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
