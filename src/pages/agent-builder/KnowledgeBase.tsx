import React, { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { agentPlatformService } from '../../services/agentPlatform.service';

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/json': ['.json'],
  'text/html': ['.html', '.htm'],
};

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB per file

const STATUS_META: Record<
  'pending' | 'ready' | 'failed',
  { label: string; cls: string }
> = {
  pending: { label: 'No documents yet — upload to start indexing', cls: 'text-secondary-600 dark:text-secondary-300' },
  ready:   { label: 'Ready — documents are indexed and searchable', cls: 'text-success-600 dark:text-success-400' },
  failed:  { label: 'Failed — see error below',                     cls: 'text-danger-600 dark:text-danger-400' },
};

const KnowledgeBase: React.FC = () => {
  const queryClient = useQueryClient();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewDoc, setPreviewDoc] = useState<{ docId: string; source: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['agent-platform', 'kb', 'status'],
    queryFn: () => agentPlatformService.getKbStatus(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: (data) =>
      data?.kb?.status === 'ready' ? false : 3000,
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) => agentPlatformService.deleteKbDocument(docId),
    onSuccess: ({ deleted }) => {
      toast.success(`Removed ${deleted} chunk${deleted === 1 ? '' : 's'}`);
      queryClient.invalidateQueries({ queryKey: ['agent-platform', 'kb', 'status'] });
    },
    onError: (err: Error) => toast.error(err.message ?? 'Delete failed'),
  });

  const { data: chunkData, isLoading: chunksLoading } = useQuery({
    queryKey: ['agent-platform', 'kb', 'chunks', previewDoc?.docId],
    queryFn: () => agentPlatformService.getKbDocumentChunks(previewDoc!.docId),
    enabled: !!previewDoc?.docId,
    staleTime: 60_000,
  });

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    if (rejected?.length) {
      const reasons = rejected
        .map((r: any) => r?.errors?.[0]?.message ?? 'rejected')
        .join('; ');
      toast.error(`Some files were rejected: ${reasons}`);
    }
    setPendingFiles((prev) => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_BYTES,
    multiple: true,
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => agentPlatformService.uploadKbDocuments(files),
    onSuccess: (result) => {
      toast.success(
        `Uploaded ${result.uploadedKeys.length} document${
          result.uploadedKeys.length === 1 ? '' : 's'
        }`,
      );
      setPendingFiles([]);
      queryClient.invalidateQueries({ queryKey: ['agent-platform', 'kb', 'status'] });
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Upload failed');
    },
  });

  const totalBytes = pendingFiles.reduce((acc, f) => acc + f.size, 0);
  const kb = data?.kb;
  const statusMeta = kb ? STATUS_META[kb.status] : null;

  return (
    <div className="bg-gradient-light-ambient dark:bg-gradient-dark-ambient py-2 px-2 sm:py-6 sm:px-4 md:py-8 md:px-6 lg:px-8 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-secondary-50">
            Knowledge Base
          </h1>
          <p className="text-sm text-secondary-600 dark:text-secondary-300 mt-1 max-w-2xl">
            Upload your docs once — every agent that uses the{' '}
            <span className="font-medium text-secondary-900 dark:text-secondary-50">
              Knowledge base
            </span>{' '}
            node can search them. Documents are stored privately in your
            CostKatana media bucket.
          </p>
        </div>

        {/* Status card */}
        <section className="p-4 md:p-5 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel md:rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-1">
                Status
              </div>
              {isLoading ? (
                <div className="h-5 w-48 bg-secondary-200 dark:bg-secondary-700 rounded animate-pulse" />
              ) : !kb ? (
                <div className="text-sm text-secondary-600 dark:text-secondary-300">
                  No knowledge base yet — upload your first document below.
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <StatusIcon status={kb.status} />
                  <span className={`text-sm font-medium ${statusMeta?.cls}`}>
                    {statusMeta?.label}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[200px]">
              <Mini value={kb?.documentCount ?? 0} label="Docs" />
              <Mini value={data?.chunkCount ?? 0} label="Chunks" />
            </div>
          </div>

          {kb?.lastError?.message && (
            <div className="mt-3 text-xs text-danger-600 dark:text-danger-400 bg-danger-50/40 dark:bg-danger-900/15 border border-danger-300/30 dark:border-danger-500/20 px-3 py-2 rounded">
              {kb.lastError.message}
            </div>
          )}
        </section>

        {/* Dropzone */}
        <section className="p-4 md:p-5 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel md:rounded-2xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-3">
            Upload documents
          </div>

          <div
            {...getRootProps()}
            className={`relative rounded-xl border-2 border-dashed p-8 sm:p-10 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-900/20'
                : 'border-primary-200/40 dark:border-primary-500/20 hover:border-primary-400/60 hover:bg-light-bg-100/30 dark:hover:bg-dark-bg-200/30'
            }`}
          >
            <input {...getInputProps()} />
            <CloudArrowUpIcon className="w-10 h-10 mx-auto mb-3 text-primary-500" />
            <div className="font-display text-base font-semibold text-secondary-900 dark:text-secondary-50 mb-1">
              {isDragActive ? 'Drop to add' : 'Drop documents here, or click to choose'}
            </div>
            <div className="text-xs text-secondary-500 dark:text-secondary-400">
              PDF · TXT · MD · CSV · DOCX · JSON · HTML · up to 25 MB each
            </div>
          </div>

          {pendingFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs text-secondary-600 dark:text-secondary-300">
                {pendingFiles.length} file{pendingFiles.length === 1 ? '' : 's'} ·{' '}
                {(totalBytes / 1024 / 1024).toFixed(2)} MB queued
              </div>
              <ul className="rounded-lg border border-primary-200/30 dark:border-primary-500/20 divide-y divide-primary-200/20 dark:divide-primary-500/10 bg-light-bg-100 dark:bg-dark-bg-100">
                {pendingFiles.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center gap-3 px-3 py-2 text-sm"
                  >
                    <DocumentIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span className="text-secondary-800 dark:text-secondary-100 truncate flex-1">
                      {f.name}
                    </span>
                    <span className="text-[11px] text-secondary-500 dark:text-secondary-400 flex-shrink-0">
                      {(f.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      className="text-[11px] text-secondary-400 hover:text-danger-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingFiles((prev) => prev.filter((_, idx) => idx !== i));
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingFiles([])}
                  className="text-xs text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-50"
                  disabled={uploadMutation.isPending}
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => uploadMutation.mutate(pendingFiles)}
                  disabled={uploadMutation.isPending || pendingFiles.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium shadow-md shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-4 h-4" /> Upload {pendingFiles.length}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Document list */}
        {data?.documents && data.documents.length > 0 && (
          <section className="p-4 md:p-5 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel md:rounded-2xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mb-3">
              Indexed documents ({data.documents.length})
            </div>
            <ul className="rounded-lg border border-primary-200/30 dark:border-primary-500/20 divide-y divide-primary-200/20 dark:divide-primary-500/10 bg-light-bg-100 dark:bg-dark-bg-100">
              {data.documents.map((doc) => (
                <li
                  key={doc.docId}
                  className="flex items-center gap-3 px-3 py-2 text-sm"
                >
                  <DocumentIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span className="text-secondary-800 dark:text-secondary-100 truncate flex-1">
                    {doc.source}
                  </span>
                  <span className="text-[11px] text-secondary-500 dark:text-secondary-400 flex-shrink-0">
                    {doc.chunks} chunk{doc.chunks === 1 ? '' : 's'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewDoc({ docId: doc.docId, source: doc.source })}
                    className="text-secondary-400 hover:text-primary-500 transition-colors"
                    aria-label={`Preview ${doc.source}`}
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(`Remove "${doc.source}" from the knowledge base?`)
                      ) {
                        deleteMutation.mutate(doc.docId);
                      }
                    }}
                    disabled={
                      deleteMutation.isPending && deleteMutation.variables === doc.docId
                    }
                    className="text-secondary-400 hover:text-danger-500 disabled:opacity-50"
                    aria-label={`Remove ${doc.source}`}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Document preview modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border shadow-2xl bg-white dark:bg-dark-bg-100 border-primary-200/30 dark:border-primary-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-primary-200/20 dark:border-primary-500/10">
              <DocumentIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span className="font-display text-sm font-semibold text-secondary-900 dark:text-secondary-50 truncate flex-1">
                {previewDoc.source}
              </span>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-50 transition-colors"
                aria-label="Close preview"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {chunksLoading ? (
                <div className="flex items-center justify-center py-12">
                  <ArrowPathIcon className="w-6 h-6 animate-spin text-primary-500" />
                </div>
              ) : !chunkData || chunkData.length === 0 ? (
                <div className="text-sm text-secondary-500 dark:text-secondary-400 text-center py-10">
                  No chunks found for this document.
                </div>
              ) : (
                chunkData.map((chunk) => (
                  <div
                    key={chunk.ordinal}
                    className="rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100 dark:bg-dark-bg-200 p-3"
                  >
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-primary-500 mb-1.5">
                      Chunk {chunk.ordinal + 1}
                    </div>
                    <p className="text-xs text-secondary-800 dark:text-secondary-200 whitespace-pre-wrap leading-relaxed">
                      {chunk.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Modal footer */}
            {chunkData && chunkData.length > 0 && (
              <div className="px-5 py-3 border-t border-primary-200/20 dark:border-primary-500/10 text-[11px] text-secondary-500 dark:text-secondary-400">
                {chunkData.length} chunk{chunkData.length === 1 ? '' : 's'} · click outside to close
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatusIcon: React.FC<{ status: 'pending' | 'creating' | 'ready' | 'failed' }> = ({
  status,
}) => {
  if (status === 'ready') return <CheckCircleIcon className="w-4 h-4 text-success-500" />;
  if (status === 'failed')
    return <ExclamationTriangleIcon className="w-4 h-4 text-danger-500" />;
  return <ArrowPathIcon className="w-4 h-4 text-highlight-500 animate-spin" />;
};

const Mini: React.FC<{ value: string | number; label: string; small?: boolean }> = ({
  value,
  label,
  small,
}) => (
  <div className="rounded-lg border border-primary-200/30 dark:border-primary-500/20 bg-light-bg-100/60 dark:bg-dark-bg-100/60 p-2">
    <div
      className={`font-display ${
        small ? 'text-base' : 'text-xl'
      } font-bold text-secondary-900 dark:text-secondary-50 leading-none`}
    >
      {value}
    </div>
    <div className="text-[10px] uppercase tracking-wider text-secondary-500 dark:text-secondary-400 mt-1">
      {label}
    </div>
  </div>
);

export default KnowledgeBase;
