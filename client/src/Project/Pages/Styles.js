import styled from 'styled-components';

import { color, font, mixin } from 'shared/utils/styles';

export const Page = styled.div`
  display: flex;
  height: calc(100vh - 0px);
  width: 100%;
`;

export const TreePane = styled.div`
  width: 280px;
  flex-shrink: 0;
  padding: 24px 16px;
  border-right: 1px solid ${color.borderLightest};
  overflow-y: auto;
`;

export const TreeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`;

export const TreeTitle = styled.h1`
  ${font.bold}
  ${font.size(20)}
  color: ${color.textDark};
`;

export const TreeItem = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 8px;
  padding-left: ${props => 8 + props.depth * 16}px;
  border-radius: 4px;
  cursor: pointer;
  ${font.size(14.5)}
  color: ${props => (props.isSelected ? color.primary : color.textDark)};
  background: ${props => (props.isSelected ? color.backgroundLight : 'transparent')};
  ${mixin.truncateText}
  &:hover {
    background: ${color.backgroundLight};
  }
`;

export const TreeItemText = styled.span`
  ${mixin.truncateText}
`;

export const EmptyTree = styled.div`
  padding: 10px 8px;
  ${font.size(13.5)}
  color: ${color.textMedium};
`;

export const ContentPane = styled.div`
  flex: 1;
  min-width: 0;
  padding: 30px 40px 60px;
  overflow-y: auto;
`;

export const ContentHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
`;

export const PageTitle = styled.h1`
  ${font.bold}
  ${font.size(28)}
  color: ${color.textDarkest};
  word-break: break-word;
`;

export const HeaderActions = styled.div`
  display: flex;
  flex-shrink: 0;
  > * + * {
    margin-left: 8px;
  }
`;

export const Meta = styled.div`
  margin-bottom: 22px;
  ${font.size(13)}
  color: ${color.textLight};
`;

export const TitleInput = styled.input`
  width: 100%;
  margin-bottom: 16px;
  padding: 6px 2px;
  border: none;
  border-bottom: 2px solid ${color.borderLight};
  ${font.bold}
  ${font.size(26)}
  color: ${color.textDarkest};
  &:focus {
    outline: none;
    border-bottom-color: ${color.primary};
  }
`;

export const EditorActions = styled.div`
  display: flex;
  margin-top: 18px;
  > * + * {
    margin-left: 10px;
  }
`;

export const EmptyContent = styled.div`
  ${font.size(15)}
  color: ${color.textMedium};
  cursor: pointer;
`;

export const Placeholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  ${font.size(16)}
  color: ${color.textLight};
`;
