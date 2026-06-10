import React from 'react';

import Button from 'shared/components/Button';
import Tooltip from 'shared/components/Tooltip';

import feedbackImage from './assets/feedback.png';
import { FeedbackDropdown, FeedbackImageCont, FeedbackImage, FeedbackParagraph } from './Styles';

const AboutTooltip = tooltipProps => (
  <Tooltip
    width={300}
    {...tooltipProps}
    renderContent={() => (
      <FeedbackDropdown>
        <FeedbackImageCont>
          <FeedbackImage src={feedbackImage} alt="フィードバックを送る" />
        </FeedbackImageCont>

        <FeedbackParagraph>
          この簡易版 Jira クローンは、フロントエンドに React、バックエンドに Node/TypeScript
          を使用して構築されています。
        </FeedbackParagraph>

        <FeedbackParagraph>
          {'詳しくはウェブサイトをご覧いただくか、こちらからご連絡ください '}
          <a href="mailto:ivor@codetree.co">
            <strong>ivor@codetree.co</strong>
          </a>
        </FeedbackParagraph>

        <a href="https://getivor.com/" target="_blank" rel="noreferrer noopener">
          <Button variant="primary">ウェブサイトを見る</Button>
        </a>

        <a href="https://github.com/oldboyxx/jira_clone" target="_blank" rel="noreferrer noopener">
          <Button style={{ marginLeft: 10 }} icon="github">
            GitHub リポジトリ
          </Button>
        </a>
      </FeedbackDropdown>
    )}
  />
);

export default AboutTooltip;
