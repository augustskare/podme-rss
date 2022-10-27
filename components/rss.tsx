import { ComponentChildren, h } from "https://esm.sh/preact@10.11.2";

type Props = { children?: ComponentChildren | ComponentChildren[] } & {
  [key: string]: unknown;
};

function tag(name: string) {
  return ({ children, ...props }: Props) =>
    h(name, { ...props, ...tag }, children);
}

export const Rss = {
  Root: ({ children }: Props) =>
    h("rss", {
      ...{
        version: "2.0",
        "xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd",
        "xmlns:content": "http://purl.org/rss/1.0/modules/content/",
      },
    }, children),
  Channel: tag("channel"),
  Description: tag("description"),
  Link: tag("link"),
  Item: tag("item"),
  Guid: tag("guid"),
  PubDate: tag("pubDate"),
  Enclosure: tag("enclosure"),
};

export const Itunes = {
  Author: tag("itunes:author"),
  Date: tag("lastBuildDate"),
  Image: tag("itunes:image"),
  Owner: tag("itunes:owner"),
  Name: tag("itunes:name"),
  Email: tag("itunes:email"),
  Title: tag("itunes:title"),
  Duration: tag("itunes:duration"),
};
