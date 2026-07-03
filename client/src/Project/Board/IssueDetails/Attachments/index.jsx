import React, { Fragment, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import { Button, Icon } from 'shared/components';

import { SectionTitle } from '../Styles';
import { List, Row, Name, Size, HiddenInput, Hint } from './Styles';

const propTypes = {
  issue: PropTypes.object.isRequired,
  fetchIssue: PropTypes.func.isRequired,
};

const MAX_MB = 10;

const formatSize = bytes => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const readAsDataUrl = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const Attachments = ({ issue, fetchIssue }) => {
  const inputRef = useRef();
  const [isWorking, setWorking] = useState(false);

  const attachments = issue.attachments || [];

  const handleSelectFile = async event => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`ファイルサイズは${MAX_MB}MBまでです。`);
      return;
    }
    setWorking(true);
    try {
      const data = await readAsDataUrl(file);
      await api.post('/attachments', {
        issueId: issue.id,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        data,
      });
      await fetchIssue();
    } catch (error) {
      toast.error(error);
    }
    setWorking(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDownload = async attachment => {
    try {
      const { attachment: full } = await api.get(`/attachments/${attachment.id}`);
      const byteChars = atob(full.data);
      const bytes = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i += 1) {
        bytes[i] = byteChars.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: full.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = full.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error);
    }
  };

  const handleDelete = async attachmentId => {
    try {
      await api.delete(`/attachments/${attachmentId}`);
      await fetchIssue();
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <Fragment>
      <SectionTitle>添付ファイル</SectionTitle>

      {attachments.length > 0 && (
        <List>
          {attachments.map(attachment => (
            <Row key={attachment.id}>
              <Icon type="attach" size={18} />
              <Name onClick={() => handleDownload(attachment)}>{attachment.originalName}</Name>
              <Size>{formatSize(attachment.size)}</Size>
              <Button variant="empty" icon="trash" onClick={() => handleDelete(attachment.id)} />
            </Row>
          ))}
        </List>
      )}

      <HiddenInput ref={inputRef} type="file" onChange={handleSelectFile} />
      <Button
        variant="empty"
        icon="attach"
        isWorking={isWorking}
        onClick={() => inputRef.current && inputRef.current.click()}
      >
        ファイルを添付
      </Button>
      <Hint>1ファイルあたり最大 {MAX_MB}MB までアップロードできます。</Hint>
    </Fragment>
  );
};

Attachments.propTypes = propTypes;

export default Attachments;
