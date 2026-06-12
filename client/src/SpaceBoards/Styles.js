import styled from 'styled-components';

import { color, font, mixin } from 'shared/utils/styles';
import Form from 'shared/components/Form';

export const Page = styled.div`
  min-height: 100vh;
  padding: 36px 24px 80px;
  background: ${color.backgroundLightest};
`;

export const Container = styled.div`
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
`;

export const Breadcrumb = styled.div`
  margin-bottom: 8px;
  ${font.size(13.5)}
  color: ${color.textMedium};
  span {
    cursor: pointer;
    &:hover {
      color: ${color.textDark};
    }
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 26px;
`;

export const HeaderMeta = styled.div`
  flex: 1;
  margin-left: 14px;
  min-width: 0;
`;

export const SpaceName = styled.h1`
  ${font.bold}
  ${font.size(26)}
  color: ${color.textDarkest};
`;

export const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 24px 0 14px;
`;

export const SectionTitle = styled.h2`
  ${font.medium}
  ${font.size(18)}
  color: ${color.textDark};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const Card = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: 18px;
  border: 1px solid ${color.borderLightest};
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  &:hover {
    box-shadow: rgba(9, 30, 66, 0.13) 0px 0px 1px, rgba(9, 30, 66, 0.13) 0px 4px 8px -2px;
  }
`;

export const CardMeta = styled.div`
  margin-left: 12px;
  min-width: 0;
`;

export const CardName = styled.div`
  ${font.medium}
  ${font.size(16)}
  color: ${color.textDark};
  ${mixin.truncateText}
`;

export const CardSub = styled.div`
  ${font.size(12.5)}
  color: ${color.textMedium};
`;

export const DeleteButton = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`;

export const Empty = styled.div`
  padding: 30px;
  text-align: center;
  ${font.size(14)}
  color: ${color.textMedium};
  border: 1px dashed ${color.borderLight};
  border-radius: 8px;
`;

export const MemberList = styled.div`
  border: 1px solid ${color.borderLightest};
  border-radius: 6px;
  background: #fff;
`;

export const MemberRow = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  &:not(:last-of-type) {
    border-bottom: 1px solid ${color.borderLightest};
  }
`;

export const MemberMeta = styled.div`
  flex: 1;
  margin-left: 12px;
  min-width: 0;
`;

export const MemberName = styled.div`
  ${font.medium}
  ${font.size(14.5)}
  color: ${color.textDark};
`;

export const MemberEmail = styled.div`
  ${font.size(12.5)}
  color: ${color.textMedium};
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
