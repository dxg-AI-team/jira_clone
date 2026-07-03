import styled from 'styled-components';

import { color, sizes, font, mixin, zIndexValues } from 'shared/utils/styles';

export const Sidebar = styled.div`
  position: fixed;
  z-index: ${zIndexValues.navLeft - 1};
  top: 0;
  left: ${sizes.appNavBarLeftWidth}px;
  height: 100vh;
  width: ${sizes.secondarySideBarWidth}px;
  padding: 0 16px 24px;
  background: ${color.backgroundLightest};
  border-right: 1px solid ${color.borderLightest};
  ${mixin.scrollableY}
  ${mixin.customScrollbar()}
  @media (max-width: 1100px) {
    width: ${sizes.secondarySideBarWidth - 10}px;
  }
  @media (max-width: 999px) {
    display: none;
  }
`;

export const Switcher = styled.div`
  position: relative;
`;

export const ProjectInfo = styled.div`
  display: flex;
  padding: 24px 4px;
  border-radius: 3px;
  cursor: pointer;
  &:hover {
    background: ${color.backgroundLight};
  }
`;

export const SwitcherDropdown = styled.div`
  position: absolute;
  z-index: ${zIndexValues.dropdown || 101};
  top: 70px;
  left: 0;
  right: 0;
  padding: 6px 0;
  background: #fff;
  border-radius: 4px;
  box-shadow: rgba(9, 30, 66, 0.25) 0px 4px 8px -2px, rgba(9, 30, 66, 0.31) 0px 0px 1px;
`;

export const SwitcherItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 14px;
  ${font.size(14)};
  color: ${props => (props.isActive ? color.primary : color.textDark)};
  background: ${props => (props.isActive ? color.backgroundLight : 'transparent')};
  cursor: pointer;
  ${mixin.truncateText}
  &:hover {
    background: ${color.backgroundLight};
  }
`;

export const SwitcherDivider = styled.div`
  margin: 6px 0;
  border-top: 1px solid ${color.borderLightest};
`;

export const SwitcherFooter = styled.div`
  padding: 8px 14px;
  ${font.size(13.5)};
  color: ${color.textMedium};
  cursor: pointer;
  &:hover {
    background: ${color.backgroundLight};
    color: ${color.textDark};
  }
`;

export const ProjectTexts = styled.div`
  min-width: 0;
  padding: 3px 0 0 10px;
`;

export const ProjectName = styled.div`
  color: ${color.textDark};
  ${font.size(15)};
  ${font.medium};
  ${mixin.truncateText};
`;

export const ProjectCategory = styled.div`
  color: ${color.textMedium};
  ${font.size(13)};
`;

export const Divider = styled.div`
  margin-top: 17px;
  padding-top: 18px;
  border-top: 1px solid ${color.borderLight};
`;

export const LinkItem = styled.div`
  position: relative;
  display: flex;
  padding: 8px 12px;
  border-radius: 3px;
  ${mixin.clickable}
  ${props =>
    !props.to ? `cursor: not-allowed;` : `&:hover { background: ${color.backgroundLight}; }`}
  i {
    margin-right: 15px;
    font-size: 20px;
  }
  &.active {
    color: ${color.primary};
    background: ${color.backgroundLight};
    i {
      color: ${color.primary};
    }
  }
`;

export const LinkText = styled.div`
  padding-top: 2px;
  ${font.size(14.7)};
`;

export const NotImplemented = styled.div`
  display: inline-block;
  position: absolute;
  top: 7px;
  left: 40px;
  width: 140px;
  padding: 5px 0 5px 8px;
  border-radius: 3px;
  text-transform: uppercase;
  color: ${color.textDark};
  background: ${color.backgroundMedium};
  opacity: 0;
  ${font.size(11.5)};
  ${font.bold}
  ${LinkItem}:hover & {
    opacity: 1;
  }
`;
