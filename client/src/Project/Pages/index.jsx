import React, { Fragment, useState, useEffect } from 'react';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import useApi from 'shared/hooks/api';
import { getTextContentsFromHtmlString } from 'shared/utils/browser';
import { formatDateTime } from 'shared/utils/dateTime';
import { Button, ConfirmModal, TextEditor, TextEditedContent, PageLoader } from 'shared/components';

import {
  Page,
  TreePane,
  TreeHeader,
  TreeTitle,
  TreeItem,
  TreeItemText,
  EmptyTree,
  ContentPane,
  ContentHeader,
  PageTitle,
  HeaderActions,
  Meta,
  TitleInput,
  EditorActions,
  EmptyContent,
  Placeholder,
} from './Styles';

const ProjectPages = () => {
  const [{ data, isLoading }, fetchPages] = useApi.get('/pages');

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [isEditing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');

  const pages = (data && data.pages) || [];

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return undefined;
    }
    let active = true;
    api
      .get(`/pages/${selectedId}`)
      .then(res => {
        if (active) setDetail(res.page);
      })
      .catch(error => toast.error(error));
    return () => {
      active = false;
    };
  }, [selectedId]);

  const selectPage = id => {
    setEditing(false);
    setSelectedId(id);
  };

  const startEdit = page => {
    setDraftTitle(page.title);
    setDraftContent(page.content || '');
    setEditing(true);
  };

  const handleCreate = async (parentPageId = null) => {
    try {
      const { page } = await api.post('/pages', { title: '無題のページ', parentPageId });
      await fetchPages();
      setSelectedId(page.id);
      setDetail(page);
      startEdit(page);
    } catch (error) {
      toast.error(error);
    }
  };

  const handleSave = async () => {
    try {
      const { page } = await api.put(`/pages/${selectedId}`, {
        title: draftTitle.trim() || '無題のページ',
        content: draftContent,
      });
      setDetail(page);
      setEditing(false);
      await fetchPages();
    } catch (error) {
      toast.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/pages/${selectedId}`);
      setSelectedId(null);
      setDetail(null);
      await fetchPages();
      toast.success('ページを削除しました。');
    } catch (error) {
      toast.error(error);
    }
  };

  const renderTree = (parentId, depth) =>
    pages
      .filter(page => (page.parentPageId || null) === parentId)
      .map(page => (
        <Fragment key={page.id}>
          <TreeItem
            depth={depth}
            isSelected={page.id === selectedId}
            onClick={() => selectPage(page.id)}
          >
            <TreeItemText>{page.title}</TreeItemText>
          </TreeItem>
          {renderTree(page.id, depth + 1)}
        </Fragment>
      ));

  if (isLoading && pages.length === 0) return <PageLoader />;

  const contentIsEmpty =
    !detail || getTextContentsFromHtmlString(detail.content || '').trim().length === 0;

  const renderContent = () => {
    if (!selectedId || !detail) {
      return <Placeholder>ページを選択するか、新しく作成してください。</Placeholder>;
    }
    if (isEditing) {
      return (
        <Fragment>
          <TitleInput
            value={draftTitle}
            placeholder="ページタイトル"
            onChange={e => setDraftTitle(e.target.value)}
          />
          <TextEditor
            placeholder="ページの内容を記述..."
            defaultValue={draftContent}
            onChange={setDraftContent}
          />
          <EditorActions>
            <Button variant="primary" onClick={handleSave}>
              保存
            </Button>
            <Button variant="empty" onClick={() => setEditing(false)}>
              キャンセル
            </Button>
          </EditorActions>
        </Fragment>
      );
    }
    return (
      <Fragment>
        <ContentHeader>
          <PageTitle>{detail.title}</PageTitle>
          <HeaderActions>
            <Button variant="empty" icon="plus" onClick={() => handleCreate(detail.id)}>
              子ページ
            </Button>
            <Button variant="secondary" onClick={() => startEdit(detail)}>
              編集
            </Button>
            <ConfirmModal
              title="このページを削除しますか？"
              message="削除すると元に戻せません。子ページは最上位に移動します。"
              confirmText="削除"
              variant="danger"
              onConfirm={({ close }) => handleDelete().then(close)}
              renderLink={({ open }) => <Button variant="empty" icon="trash" onClick={open} />}
            />
          </HeaderActions>
        </ContentHeader>
        <Meta>最終更新: {formatDateTime(detail.updatedAt)}</Meta>
        {contentIsEmpty ? (
          <EmptyContent onClick={() => startEdit(detail)}>内容を追加...</EmptyContent>
        ) : (
          <TextEditedContent content={detail.content} onClick={() => startEdit(detail)} />
        )}
      </Fragment>
    );
  };

  return (
    <Page>
      <TreePane>
        <TreeHeader>
          <TreeTitle>ページ</TreeTitle>
          <Button icon="plus" variant="empty" onClick={() => handleCreate(null)} />
        </TreeHeader>
        {pages.length === 0 ? (
          <EmptyTree>ページはまだありません。＋ で作成できます。</EmptyTree>
        ) : (
          renderTree(null, 0)
        )}
      </TreePane>

      <ContentPane>{renderContent()}</ContentPane>
    </Page>
  );
};

export default ProjectPages;
