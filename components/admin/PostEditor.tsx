"use client";

import Link from "next/link";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  POST_CATEGORIES,
  type Post,
  type PostStatus,
} from "@/lib/post-types";

type PostEditorProps = {
  post?: Post;
  notice?: "draft" | "published";
};

type ApiPostResponse = {
  post?: Post;
  error?: string;
};

function newPostSlug() {
  const now = new Date();
  const numbers = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ];
  return `post-${numbers.join("")}`;
}

export function PostEditor({ post, notice }: PostEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? newPostSlug);
  const [description, setDescription] = useState(post?.description ?? "");
  const [category, setCategory] = useState(post?.category ?? "Frontend");
  const [tags, setTags] = useState(post?.tags.join(", ") ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [previewHtml, setPreviewHtml] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [message, setMessage] = useState(
    notice === "published"
      ? "글을 발행했습니다."
      : notice === "draft"
        ? "임시 저장했습니다."
        : "",
  );

  const endpoint = post ? `/api/admin/posts/${post.id}` : "/api/admin/posts";
  const method = post ? "PUT" : "POST";
  const publicHref = post?.status === "published" ? `/posts/${post.slug}` : null;
  const tagList = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tags],
  );

  useEffect(() => {
    if (activeTab !== "preview") return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/admin/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
          signal: controller.signal,
        });
        const result = (await response.json()) as {
          html?: string;
          error?: string;
        };
        if (response.ok) {
          setPreviewHtml(result.html ?? "");
        } else {
          setMessage(result.error ?? "미리보기를 불러오지 못했습니다.");
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setMessage("미리보기를 불러오지 못했습니다.");
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [activeTab, content]);

  async function save(status: PostStatus) {
    setMessage("");
    setIsSaving(true);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          category,
          tags: tagList,
          content,
          status,
        }),
      });
      const result = (await response.json()) as ApiPostResponse;
      if (!response.ok || !result.post) {
        setMessage(result.error ?? "글을 저장하지 못했습니다.");
        return;
      }

      const saved = status === "published" ? "published" : "draft";
      window.location.assign(
        `/admin/posts/${result.post.id}/edit?saved=${saved}`,
      );
    } catch {
      setMessage("네트워크 오류로 글을 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save(post?.status ?? "draft");
  }

  async function handleDelete() {
    if (!post || !window.confirm("이 글을 삭제할까요? 삭제하면 복구할 수 없습니다.")) {
      return;
    }
    setMessage("");
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setMessage(result.error ?? "글을 삭제하지 못했습니다.");
        return;
      }
      window.location.assign("/admin");
    } catch {
      setMessage("네트워크 오류로 글을 삭제하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="editor" onSubmit={handleSubmit}>
      <div className="editor-topbar">
        <div>
          <Link className="admin-back-link" href="/admin">
            ← 글 관리
          </Link>
          <div className="editor-title-row">
            <h1>{post ? "글 수정" : "새 글 작성"}</h1>
            {post ? (
              <span className={`status-badge status-${post.status}`}>
                {post.status === "published" ? "발행됨" : "임시 저장"}
              </span>
            ) : null}
          </div>
        </div>
        <div className="editor-actions">
          {publicHref ? (
            <Link className="button button-ghost" href={publicHref} target="_blank">
              공개 글 보기
            </Link>
          ) : null}
          {post ? (
            <button
              className="button button-danger"
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
            >
              삭제
            </button>
          ) : null}
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void save("draft")}
            disabled={isSaving}
          >
            {isSaving ? "저장 중" : "임시 저장"}
          </button>
          <button
            className="button button-primary"
            type="button"
            onClick={() => void save("published")}
            disabled={isSaving}
          >
            {isSaving ? "저장 중" : "발행하기"}
          </button>
        </div>
      </div>

      {message ? <p className="editor-message" role="status">{message}</p> : null}

      <div className="editor-fields">
        <label className="field field-wide">
          <span>제목</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="글 제목을 입력하세요"
            maxLength={120}
            required
          />
        </label>

        <label className="field field-wide">
          <span>한 줄 요약</span>
          <textarea
            className="description-input"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="글 목록과 검색 결과에 보일 설명을 입력하세요"
            maxLength={300}
            required
          />
          <small>{description.length}/300</small>
        </label>

        <label className="field">
          <span>카테고리</span>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as typeof category)
            }
          >
            {POST_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>태그</span>
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="React, TypeScript, 회고"
          />
          <small>쉼표로 구분해 주세요.</small>
        </label>

        <label className="field field-wide">
          <span>글 주소</span>
          <div className="slug-field">
            <span>/posts/</span>
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value.toLowerCase())}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              maxLength={100}
              required
            />
          </div>
          <small>영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.</small>
        </label>
      </div>

      <section className="editor-body">
        <div className="editor-tabs" role="tablist" aria-label="본문 편집 방식">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "write"}
            onClick={() => setActiveTab("write")}
          >
            작성
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "preview"}
            onClick={() => setActiveTab("preview")}
          >
            미리보기
          </button>
          <span>Markdown 지원</span>
        </div>

        {activeTab === "write" ? (
          <textarea
            className="markdown-editor"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={"## 소제목\n\n본문을 작성하세요.\n\n- 목록\n- 코드 블록과 표도 사용할 수 있습니다."}
            spellCheck="false"
          />
        ) : (
          <div className="editor-preview prose">
            {previewHtml ? (
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <p className="preview-empty">작성한 내용이 여기에 표시됩니다.</p>
            )}
          </div>
        )}
      </section>
    </form>
  );
}
