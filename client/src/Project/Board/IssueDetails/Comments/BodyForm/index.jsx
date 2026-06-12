import React, { Fragment, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { Textarea, Avatar } from 'shared/components';

import { Actions, FormButton, MentionWrap, MentionList, MentionItem, MentionName } from './Styles';

const propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isWorking: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  mentionUsers: PropTypes.array,
};

const defaultProps = {
  mentionUsers: [],
};

// Matches an in-progress "@query" immediately before the caret.
const MENTION_RE = /@([^\s@]{0,30})$/;

const ProjectBoardIssueDetailsCommentsBodyForm = ({
  value,
  onChange,
  isWorking,
  onSubmit,
  onCancel,
  mentionUsers,
}) => {
  const $textareaRef = useRef();
  const [query, setQuery] = useState(null);
  const [caret, setCaret] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const matches =
    query === null
      ? []
      : mentionUsers
          .filter(u => u.name && u.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 6);

  const detectMention = (text, cursorPos) => {
    const before = text.slice(0, cursorPos);
    const match = before.match(MENTION_RE);
    if (match) {
      setQuery(match[1]);
      setCaret(cursorPos);
      setActiveIndex(0);
    } else {
      setQuery(null);
    }
  };

  const handleChange = (text, event) => {
    onChange(text);
    detectMention(text, event.target.selectionStart);
  };

  const insertMention = user => {
    const before = value.slice(0, caret).replace(MENTION_RE, `@${user.name} `);
    const after = value.slice(caret);
    onChange(before + after);
    setQuery(null);
    if ($textareaRef.current) {
      const pos = before.length;
      // Restore focus and place the caret right after the inserted mention.
      window.requestAnimationFrame(() => {
        $textareaRef.current.focus();
        $textareaRef.current.setSelectionRange(pos, pos);
      });
    }
  };

  const handleKeyDown = event => {
    if (query === null || matches.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(i => (i + 1) % matches.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(i => (i - 1 + matches.length) % matches.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      insertMention(matches[activeIndex]);
    } else if (event.key === 'Escape') {
      setQuery(null);
    }
  };

  const handleSubmit = () => {
    if ($textareaRef.current.value.trim()) {
      onSubmit();
    }
  };

  return (
    <Fragment>
      <MentionWrap>
        <Textarea
          autoFocus
          placeholder="コメントを追加...（@ でメンション）"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={$textareaRef}
        />
        {query !== null && matches.length > 0 && (
          <MentionList>
            {matches.map((user, i) => (
              <MentionItem
                key={user.id}
                active={i === activeIndex}
                onMouseDown={e => {
                  e.preventDefault();
                  insertMention(user);
                }}
              >
                <Avatar size={24} name={user.name} avatarUrl={user.avatarUrl} />
                <MentionName>{user.name}</MentionName>
              </MentionItem>
            ))}
          </MentionList>
        )}
      </MentionWrap>
      <Actions>
        <FormButton variant="primary" isWorking={isWorking} onClick={handleSubmit}>
          保存
        </FormButton>
        <FormButton variant="empty" onClick={onCancel}>
          キャンセル
        </FormButton>
      </Actions>
    </Fragment>
  );
};

ProjectBoardIssueDetailsCommentsBodyForm.propTypes = propTypes;
ProjectBoardIssueDetailsCommentsBodyForm.defaultProps = defaultProps;

export default ProjectBoardIssueDetailsCommentsBodyForm;
