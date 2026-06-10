import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useRouteMatch } from 'react-router-dom';

import api from 'shared/utils/api';
import toast from 'shared/utils/toast';
import { IssueTypeCopy, IssueStatusCopy } from 'shared/constants/issues';
import { Button } from 'shared/components';

import { parseJiraCsv, buildJiraCsv, downloadCsv } from './parseJiraCsv';
import {
  Page,
  Title,
  Intro,
  FileRow,
  FileButton,
  FileName,
  Section,
  SectionTitle,
  Chips,
  Chip,
  Row,
  RowTitle,
  RowMeta,
  Warning,
  ImportButton,
  Result,
} from './Styles';

const FIELD_LABELS = {
  title: '概要',
  description: '説明',
  type: '種別',
  status: 'ステータス',
  priority: '優先度',
  assignee: '担当者',
  reporter: '報告者',
  version: 'リリース',
  component: 'コンポーネント',
};

const propTypes = {
  project: PropTypes.object.isRequired,
  fetchProject: PropTypes.func.isRequired,
};

const ProjectImport = ({ project, fetchProject }) => {
  const history = useHistory();
  const match = useRouteMatch();

  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState(null);
  const [isImporting, setImporting] = useState(false);
  const [isExporting, setExporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get('/export');
      const csv = buildJiraCsv(res.issues || []);
      downloadCsv(csv, `${res.projectName || 'project'}.csv`);
      toast.success(`${(res.issues || []).length} 件の課題をエクスポートしました。`);
    } catch (error) {
      toast.error(error);
    }
    setExporting(false);
  };

  const handleFile = event => {
    const file = event.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = e => {
      try {
        setParsed(parseJiraCsv(e.target.result));
      } catch (err) {
        toast.error({ message: 'CSV の解析に失敗しました。' });
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!parsed || !parsed.rows.length) return;
    setImporting(true);
    try {
      const res = await api.post('/import', { rows: parsed.rows });
      await fetchProject();
      setResult(res);
      toast.success(`${res.created} 件の課題をインポートしました。`);
    } catch (error) {
      toast.error(error);
    }
    setImporting(false);
  };

  const rows = parsed ? parsed.rows : [];
  const detected = parsed ? parsed.detected : {};
  const hasTitleColumn = !!detected.title;

  return (
    <Page>
      <Title>インポート / エクスポート</Title>

      <Section>
        <SectionTitle>エクスポート</SectionTitle>
        <Intro>
          現在のプロジェクト「{project.name}」の課題を CSV
          で書き出します（再インポート可能な形式）。
        </Intro>
        <ImportButton variant="primary" isWorking={isExporting} onClick={handleExport}>
          CSVをエクスポート
        </ImportButton>
      </Section>

      <Intro>
        本物の Jira から「エクスポート &gt; CSV」で書き出したファイルを、現在のプロジェクト「
        {project.name}」に取り込みます。担当者・報告者はメンバーと名前/メールで照合し、Fix Version
        はリリース、Component はコンポーネントとして自動作成します。
      </Intro>

      <FileRow>
        <FileButton>
          CSVファイルを選択
          <input type="file" accept=".csv,text/csv" onChange={handleFile} />
        </FileButton>
        {fileName && <FileName>{fileName}</FileName>}
      </FileRow>

      {parsed && (
        <React.Fragment>
          <Section>
            <SectionTitle>取り込み内容のプレビュー（{rows.length} 件）</SectionTitle>

            <Chips>
              {Object.keys(detected).map(field => (
                <Chip key={field}>
                  {FIELD_LABELS[field] || field}: {detected[field].join(', ')}
                </Chip>
              ))}
            </Chips>

            {!hasTitleColumn && (
              <Warning>
                「概要(Summary)」列が見つかりませんでした。CSV のヘッダをご確認ください。
              </Warning>
            )}

            <div style={{ marginTop: 14 }}>
              {rows.slice(0, 5).map((row, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <Row key={i}>
                  <RowTitle>{row.title}</RowTitle>
                  <RowMeta>
                    {IssueTypeCopy[row.type.toLowerCase()] || row.type || '—'} /{' '}
                    {IssueStatusCopy[row.status.toLowerCase()] || row.status || '—'}
                  </RowMeta>
                </Row>
              ))}
              {rows.length > 5 && <Row>ほか {rows.length - 5} 件…</Row>}
            </div>
          </Section>

          <ImportButton
            variant="primary"
            isWorking={isImporting}
            disabled={!rows.length || !hasTitleColumn}
            onClick={handleImport}
          >
            {rows.length} 件をインポート
          </ImportButton>
        </React.Fragment>
      )}

      {result && (
        <Result>
          インポート完了
          <br />
          作成した課題: {result.created} 件
          {result.skipped ? `（${result.skipped} 件スキップ）` : ''}
          <br />
          作成したリリース: {result.versionsCreated} / コンポーネント: {result.componentsCreated}
          <br />
          {result.unmatchedUsers && result.unmatchedUsers.length > 0 && (
            <React.Fragment>
              照合できなかったユーザー（未割り当て扱い）: {result.unmatchedUsers.join(', ')}
              <br />
            </React.Fragment>
          )}
          <Button
            variant="empty"
            onClick={() => history.push(`${match.url.replace(/\/import$/, '')}/board`)}
          >
            ボードで確認する →
          </Button>
        </Result>
      )}
    </Page>
  );
};

ProjectImport.propTypes = propTypes;

export default ProjectImport;
