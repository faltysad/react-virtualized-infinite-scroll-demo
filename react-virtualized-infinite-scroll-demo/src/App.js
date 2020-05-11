import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AutoSizer,
  InfiniteLoader,
  List,
  WindowScroller
} from "react-virtualized";
import "./styles.css";

const REPOSITORIES_PER_PAGE = 100;
const BASE_GITHUB_API_URL = "https://api.github.com";
const GITHUB_API_SEARCH_QUERY = `/search/repositories?q=language:javascript&sort=stars&per_page=${REPOSITORIES_PER_PAGE}`;

const handleRedirectToRepository = repositoryUrl => {
  window.open(repositoryUrl, "_blank");
};

const fetchRepositories = async page => {
  try {
    const { data } = await axios.get(
      `${BASE_GITHUB_API_URL}${GITHUB_API_SEARCH_QUERY}&page=${page}`
    );

    return data.items;
  } catch (error) {
    console.log(error);
    throw new Error("Error while fetching repositories from the GitHub API!");
  }
};

const Row = ({ style, repository }) => (
  <div
    className="listItem"
    style={style}
    onClick={() => handleRedirectToRepository(repository.html_url)}
  >
    <span className="repositoryName">{repository.full_name}</span>
    <span>
      (
      <span role="img" aria-label="star emoji">
        ⭐
      </span>
      {repository.stargazers_count})
    </span>
  </div>
);

export default function App() {
  const [pageCount, setPageCount] = useState(1);
  const [repositories, setRepositories] = useState([]);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const repositories = await fetchRepositories(1);

      setRepositories(repositories);
      setPageCount(pageCount => pageCount + 1);
    })();
  }, []);

  const rowRenderer = ({
    key, // Unique key within array of rows
    index, // Index of row within collection
    style // Style object to be applied to row (to position it)
  }) => {
    return (
      <Row
        key={key}
        index={index}
        style={style}
        repository={repositories[index]}
      />
    );
  };

  function isRowLoaded({ index }) {
    return !!repositories[index];
  }

  const handleNewPageLoad = async () => {
    setIsNextPageLoading(true);
    const repositories = await fetchRepositories(pageCount);

    setPageCount(pageCount => pageCount + 1);
    setRepositories(currentRepositories => [
      ...currentRepositories,
      ...repositories
    ]);
    setIsNextPageLoading(false);
    return;
  };

  const loadMoreRows = isNextPageLoading ? () => {} : handleNewPageLoad;

  if (!repositories.length) return <span>Loading initial repositories</span>;

  return (
    <div className="container">
      <div className="heading">
        <h1>react-virtualized-infinite-scroll-demo</h1>
        <p>
          This is a simple showcase of performant infinite-scroll experience
          using react-virtualized. This example handles infinite-scroll based on
          window scroll position, which gives us the ability to create
          "newsfeed-like" infinite-scroll layouts. In this example, as the user
          scrolls, we fetch data about trending repositories from the GitHub
          API.
        </p>
      </div>
      <div className="repositoriesWrapper">
        <AutoSizer disableHeight={true}>
          {({ width }) => (
            <WindowScroller>
              {({ height, isScrolling, onChildScroll, scrollTop }) => (
                <InfiniteLoader
                  isRowLoaded={isRowLoaded}
                  loadMoreRows={loadMoreRows}
                  rowCount={1000}
                >
                  {({ onRowsRendered, registerChild }) => (
                    <List
                      autoHeight
                      onRowsRendered={onRowsRendered}
                      ref={registerChild}
                      height={height}
                      isScrolling={isScrolling}
                      onScroll={onChildScroll}
                      rowCount={repositories.length}
                      rowHeight={42}
                      rowRenderer={rowRenderer}
                      scrollTop={scrollTop}
                      width={width}
                    />
                  )}
                </InfiniteLoader>
              )}
            </WindowScroller>
          )}
        </AutoSizer>
        {isNextPageLoading && <span>loading more repositories..</span>}
      </div>
    </div>
  );
}
