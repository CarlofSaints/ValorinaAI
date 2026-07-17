import "server-only";

// Thin monday.com GraphQL client. Endpoint + auth per
// https://developer.monday.com/api-reference/docs/basics
const ENDPOINT = "https://api.monday.com/v2";
const API_VERSION = process.env.MONDAY_API_VERSION || "2024-10";

export function hasMondayToken() {
  return Boolean(process.env.MONDAY_API_TOKEN);
}

export async function mondayFetch<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) throw new Error("MONDAY_API_TOKEN is not set");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      "API-Version": API_VERSION,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(
      "monday API error: " + json.errors.map((e: { message: string }) => e.message).join("; ")
    );
  }
  return json.data as T;
}

// ---- Introspection: discover a board's columns + one sample item ----
export interface BoardColumn {
  id: string;
  title: string;
  type: string;
}
export interface BoardIntrospection {
  id: string;
  name: string;
  columns: BoardColumn[];
  groups: { id: string; title: string }[];
  sampleItem: {
    id: string;
    name: string;
    column_values: { id: string; title: string; text: string | null; type: string }[];
  } | null;
}

export async function introspectBoard(boardId: string): Promise<BoardIntrospection | null> {
  const data = await mondayFetch<{
    boards: Array<{
      id: string;
      name: string;
      columns: BoardColumn[];
      groups: { id: string; title: string }[];
      items_page: {
        items: Array<{
          id: string;
          name: string;
          column_values: Array<{ id: string; text: string | null; type: string; column: { title: string } }>;
        }>;
      };
    }>;
  }>(
    `query ($board: [ID!]) {
      boards(ids: $board) {
        id
        name
        columns { id title type }
        groups { id title }
        items_page(limit: 1) {
          items {
            id
            name
            column_values { id text type column { title } }
          }
        }
      }
    }`,
    { board: [boardId] }
  );

  const board = data.boards?.[0];
  if (!board) return null;
  const item = board.items_page?.items?.[0];
  return {
    id: board.id,
    name: board.name,
    columns: board.columns,
    groups: board.groups,
    sampleItem: item
      ? {
          id: item.id,
          name: item.name,
          column_values: item.column_values.map((c) => ({
            id: c.id,
            title: c.column.title,
            text: c.text,
            type: c.type,
          })),
        }
      : null,
  };
}

// ---- Read a single item's column values + attached files ----
export interface MondayItem {
  id: string;
  name: string;
  columns: Record<string, string>; // columnId -> text value
  files: { name: string; publicUrl: string; extension: string; size: number }[];
}

export async function getItem(itemId: string): Promise<MondayItem | null> {
  const data = await mondayFetch<{
    items: Array<{
      id: string;
      name: string;
      column_values: Array<{
        id: string;
        text: string | null;
        files?: Array<{ asset?: { name: string; public_url: string; file_extension: string; file_size: number } }>;
      }>;
    }>;
  }>(
    `query ($ids: [ID!]) {
      items(ids: $ids) {
        id
        name
        column_values {
          id
          text
          ... on FileValue {
            files {
              ... on FileAssetValue {
                asset { name public_url file_extension file_size }
              }
            }
          }
        }
      }
    }`,
    { ids: [itemId] }
  );

  const item = data.items?.[0];
  if (!item) return null;
  const columns: Record<string, string> = {};
  const files: MondayItem["files"] = [];
  for (const cv of item.column_values) {
    if (cv.text) columns[cv.id] = cv.text;
    for (const f of cv.files || []) {
      if (f.asset?.public_url) {
        files.push({
          name: f.asset.name,
          publicUrl: f.asset.public_url,
          extension: f.asset.file_extension,
          size: f.asset.file_size,
        });
      }
    }
  }
  return { id: item.id, name: item.name, columns, files };
}

// ---- Register a webhook (used once, during setup) ----
export async function createWebhook(params: {
  boardId: string;
  url: string;
  event: string; // e.g. "change_specific_column_value"
  config?: Record<string, unknown>;
}): Promise<{ id: string; boardId: string } | null> {
  const data = await mondayFetch<{ create_webhook: { id: string; board_id: string } }>(
    `mutation ($board: ID!, $url: String!, $event: WebhookEventType!, $config: JSON) {
      create_webhook(board_id: $board, url: $url, event: $event, config: $config) {
        id
        board_id
      }
    }`,
    {
      board: params.boardId,
      url: params.url,
      event: params.event,
      config: params.config ? JSON.stringify(params.config) : undefined,
    }
  );
  const w = data.create_webhook;
  return w ? { id: w.id, boardId: w.board_id } : null;
}
