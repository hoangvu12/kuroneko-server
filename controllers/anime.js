const axios = require("axios");
const cheerio = require("cheerio");

const { serialize, isValidUrl } = require("../utils");

const BASE_URL = "https://hentaiz.cc";

const selectors = {
  sectionTitle: ".d-flex.justify-content-between.align-items-start.mb-2",
  videosContainer: ".videos",
  video: ".col.text-center",
  title: "#title",
  like: "#like",
  dislike: "#dislike",
  studio: "#studio",
  censorship: "#censorship",
  altTitle: "p:contains('Tên khác')",
  releasedDate: "p:contains('Năm phát hành')",
  playlist: "p:contains('Trọn bộ')",
  categories: ".rounded.p-3 ul",
  description: ".rounded.p-3 p",
  list: "div[data-id]",
  player: "#player",
  searchForm: "#search-form",
};

const LIST_PER_PAGE = 24;

class HENTAIZ {
  static async homepage(req, res) {
    const URL = BASE_URL;

    const { data } = await axios.get(URL);

    const $ = cheerio.load(data);

    const sectionLength = $(".videos").length;

    const titles = $(selectors.sectionTitle)
      .map(function () {
        const $e = $(this);

        const title = $e.find(".h3.font-weight-light.mb-0").text().trim();
        const time = $e.find(".small.text-white-50").text().trim();

        return { title, updatedAt: time };
      })
      .toArray();

    const videos = $(selectors.videosContainer)
      .toArray()
      .map(function (e, i) {
        return {
          videos: parseList($(e).find(selectors.list), $),
        };
      });

    const sections = [];

    for (let i = 0; i < sectionLength; i++) {
      sections.push({
        ...titles[i],
        ...videos[i],
      });
    }

    res.json({ success: true, data: sections });
  }

  static async getVideoInfo(req, res) {
    const { slug } = req.params;

    const URL = `${BASE_URL}/${slug}`;

    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);

    const title = $(selectors.title).text().trim();
    const views = $(selectors.title).parent().find("p").text().trim();
    const likes = $(selectors.like).text().trim();
    const dislikes = $(selectors.dislike).text().trim();
    const altTitle = $(selectors.altTitle).parent().find("li").text().trim();
    const releasedDate = $(selectors.releasedDate)
      .parent()
      .find("li")
      .text()
      .trim();
    const description = $(selectors.description).text().trim();

    const studios = $(selectors.studio)
      .find("li")
      .toArray()
      .map((e) => $(e).find("a").text().trim());

    const playlists = $(selectors.playlist)
      .parent()
      .find("li")
      .toArray()
      .map((e) => ({
        name: $(e).find("a").text().trim(),
        slug: parseSlug($(e).find("a").attr("href")),
      }));

    const censorship = $(selectors.censorship)
      .find("a")
      .toArray()
      .map((e) => $(e).text().trim());

    const categories = $(selectors.categories)
      .find("li")
      .toArray()
      .map((e) => ({
        name: $(e).find("a").text().trim(),
        slug: parseSlug($(e).find("a").attr("href")),
      }));
    const related = parseList($(selectors.list), $);

    const source = parseVideoSource($(selectors.player).attr("src"));

    res.json({
      success: true,
      data: {
        title,
        views,
        likes,
        dislikes,
        studios,
        playlists,
        censorship,
        releasedDate,
        altTitle,
        categories,
        description,
        related,
        source,
      },
    });
  }

  static async parseListFromCategory(req, res) {
    const { category, page = 1 } = req.params;

    const URL = `https://hentaiz.cc/category/${category}/page/${page}`;

    const { data: axiosData } = await axios.get(URL);
    const $ = cheerio.load(axiosData);

    const total = Number(
      $(selectors.searchForm)
        .find("small")
        .text()
        .trim()
        .replaceArray(["(", ")", ",", "."], "")
    );
    const name = $(selectors.searchForm)
      .find("h2")
      .children()
      .remove()
      .end()
      .text()
      .trim();

    const description = $(selectors.searchForm).find("p").text().trim();
    const data = parseList($(selectors.list), $);

    const pages = Number(total / LIST_PER_PAGE).round();

    res.json({
      success: true,
      data: {
        name,
        description,
        total,
        pages,
        page,
        videos: data,
      },
    });
  }

  static async search(req, res) {
    const { keyword } = req.query;

    const postData = serialize({
      action: "live_search",
      keyword,
    });
    const { data } = await axios.post(
      `${BASE_URL}/wp-admin/admin-ajax.php`,
      postData
    );

    res.json({
      success: true,
      data: data.data.results.map((result) => ({
        studios: [result.studios],
        title: result.title,
        image: getImageUrl(result.thumbnail),
        views: result.views,
        slug: parseSlug(result.permalink),
      })),
    });
  }
}

const getImageUrl = (url) => {
  return isValidUrl(url) ? url : `${BASE_URL}${url}`;
};

const parseList = (cheerioNode, $) => {
  return cheerioNode.toArray().map((e) => ({
    image: getImageUrl($(e).find("img").data("src")),
    slug: parseSlug($(e).find(".card-title a").attr("href")),
    title: $(e).find(".card-title a").text().trim(),
    studios: [$(e).find(".card-body div").text().trim()],
  }));
};

const parseSlug = (url) => {
  const splitted = url.split("/");

  return splitted[splitted.length - 2];
};

const parseVideoSource = (url) => {
  if (!url.includes("?url")) {
    const splitted = url.split("/");

    const source = `https://loading.irec.top/api/hls/${
      splitted[splitted.length - 1]
    }/playlist.m3u8`;

    return source;
  }

  const { searchParams } = new URL(url);

  return searchParams.get("url");
};

module.exports = HENTAIZ;
