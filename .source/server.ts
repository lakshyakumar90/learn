// @ts-nocheck
import * as __fd_glob_39 from "../content/projects/excalidraw/tech-stack.mdx?collection=projects"
import * as __fd_glob_38 from "../content/projects/excalidraw/packages/validations.mdx?collection=projects"
import * as __fd_glob_37 from "../content/projects/excalidraw/packages/ui.mdx?collection=projects"
import * as __fd_glob_36 from "../content/projects/excalidraw/packages/tooling.mdx?collection=projects"
import * as __fd_glob_35 from "../content/projects/excalidraw/packages/redis.mdx?collection=projects"
import * as __fd_glob_34 from "../content/projects/excalidraw/packages/index.mdx?collection=projects"
import * as __fd_glob_33 from "../content/projects/excalidraw/packages/engine.mdx?collection=projects"
import * as __fd_glob_32 from "../content/projects/excalidraw/packages/db.mdx?collection=projects"
import * as __fd_glob_31 from "../content/projects/excalidraw/packages/common.mdx?collection=projects"
import * as __fd_glob_30 from "../content/projects/excalidraw/packages/backend-common.mdx?collection=projects"
import * as __fd_glob_29 from "../content/projects/excalidraw/packages/auth.mdx?collection=projects"
import * as __fd_glob_28 from "../content/projects/excalidraw/monorepo.mdx?collection=projects"
import * as __fd_glob_27 from "../content/projects/excalidraw/low-level.mdx?collection=projects"
import * as __fd_glob_26 from "../content/projects/excalidraw/installation.mdx?collection=projects"
import * as __fd_glob_25 from "../content/projects/excalidraw/index.mdx?collection=projects"
import * as __fd_glob_24 from "../content/projects/excalidraw/high-level.mdx?collection=projects"
import * as __fd_glob_23 from "../content/projects/excalidraw/folder-structure.mdx?collection=projects"
import * as __fd_glob_22 from "../content/projects/excalidraw/end-to-end.mdx?collection=projects"
import * as __fd_glob_21 from "../content/projects/excalidraw/deployment-verify.mdx?collection=projects"
import * as __fd_glob_20 from "../content/projects/excalidraw/deployment-overview.mdx?collection=projects"
import * as __fd_glob_19 from "../content/projects/excalidraw/deployment-frontend.mdx?collection=projects"
import * as __fd_glob_18 from "../content/projects/excalidraw/deployment-env.mdx?collection=projects"
import * as __fd_glob_17 from "../content/projects/excalidraw/deployment-database.mdx?collection=projects"
import * as __fd_glob_16 from "../content/projects/excalidraw/deployment-cold-starts.mdx?collection=projects"
import * as __fd_glob_15 from "../content/projects/excalidraw/deployment-cloudflare.mdx?collection=projects"
import * as __fd_glob_14 from "../content/projects/excalidraw/deployment-backend.mdx?collection=projects"
import * as __fd_glob_13 from "../content/projects/excalidraw/apps/ws-server.mdx?collection=projects"
import * as __fd_glob_12 from "../content/projects/excalidraw/apps/web.mdx?collection=projects"
import * as __fd_glob_11 from "../content/projects/excalidraw/apps/index.mdx?collection=projects"
import * as __fd_glob_10 from "../content/projects/excalidraw/apps/http-server.mdx?collection=projects"
import * as __fd_glob_9 from "../content/projects/excalidraw/apps/flush-worker.mdx?collection=projects"
import { default as __fd_glob_8 } from "../content/projects/meta.json?collection=projects"
import { default as __fd_glob_7 } from "../content/projects/excalidraw/packages/meta.json?collection=projects"
import { default as __fd_glob_6 } from "../content/projects/excalidraw/meta.json?collection=projects"
import { default as __fd_glob_5 } from "../content/projects/excalidraw/libraries.yaml?collection=projects"
import { default as __fd_glob_4 } from "../content/projects/excalidraw/apps/meta.json?collection=projects"
import * as __fd_glob_3 from "../content/topics/index.mdx?collection=topics"
import { default as __fd_glob_2 } from "../content/topics/meta.json?collection=topics"
import * as __fd_glob_1 from "../content/books/index.mdx?collection=books"
import { default as __fd_glob_0 } from "../content/books/meta.json?collection=books"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();

export const books = await create.docs("books", "content/books", {"meta.json": __fd_glob_0, }, {"index.mdx": __fd_glob_1, });

export const projects = await create.docs("projects", "content/projects", {"excalidraw/apps/meta.json": __fd_glob_4, "excalidraw/libraries.yaml": __fd_glob_5, "excalidraw/meta.json": __fd_glob_6, "excalidraw/packages/meta.json": __fd_glob_7, "meta.json": __fd_glob_8, }, {"excalidraw/apps/flush-worker.mdx": __fd_glob_9, "excalidraw/apps/http-server.mdx": __fd_glob_10, "excalidraw/apps/index.mdx": __fd_glob_11, "excalidraw/apps/web.mdx": __fd_glob_12, "excalidraw/apps/ws-server.mdx": __fd_glob_13, "excalidraw/deployment-backend.mdx": __fd_glob_14, "excalidraw/deployment-cloudflare.mdx": __fd_glob_15, "excalidraw/deployment-cold-starts.mdx": __fd_glob_16, "excalidraw/deployment-database.mdx": __fd_glob_17, "excalidraw/deployment-env.mdx": __fd_glob_18, "excalidraw/deployment-frontend.mdx": __fd_glob_19, "excalidraw/deployment-overview.mdx": __fd_glob_20, "excalidraw/deployment-verify.mdx": __fd_glob_21, "excalidraw/end-to-end.mdx": __fd_glob_22, "excalidraw/folder-structure.mdx": __fd_glob_23, "excalidraw/high-level.mdx": __fd_glob_24, "excalidraw/index.mdx": __fd_glob_25, "excalidraw/installation.mdx": __fd_glob_26, "excalidraw/low-level.mdx": __fd_glob_27, "excalidraw/monorepo.mdx": __fd_glob_28, "excalidraw/packages/auth.mdx": __fd_glob_29, "excalidraw/packages/backend-common.mdx": __fd_glob_30, "excalidraw/packages/common.mdx": __fd_glob_31, "excalidraw/packages/db.mdx": __fd_glob_32, "excalidraw/packages/engine.mdx": __fd_glob_33, "excalidraw/packages/index.mdx": __fd_glob_34, "excalidraw/packages/redis.mdx": __fd_glob_35, "excalidraw/packages/tooling.mdx": __fd_glob_36, "excalidraw/packages/ui.mdx": __fd_glob_37, "excalidraw/packages/validations.mdx": __fd_glob_38, "excalidraw/tech-stack.mdx": __fd_glob_39, });

export const topics = await create.docs("topics", "content/topics", {"meta.json": __fd_glob_2, }, {"index.mdx": __fd_glob_3, });