"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const showStar = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
      ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}
function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `<span class="star">
  <i class="${starType} fa-star"></i>
  </span>`;
}
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function addNewStoriesOnPage(evt) {
  console.debug("addNewStoriesOnPage");
  evt.preventDefault();

  const title = $("#title").val();
  const author = $("#author").val();
  const url = $("#url").val();
  const username = currentUser.username;
  const storyData = { title, author, url, username };

  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $addStoryForm.hide();
  $addStoryForm.trigger("reset");
}
$addStoryForm.on("submit", addNewStoriesOnPage);

function addFavoritesListOnPage() {
  console.debug("addFavoritesListOnPage");
  $favoriteStoriesList.empty();

  if (currentUser.favorites.length === 0) {
    $favoriteStoriesList.append("<h5>No favorites have been added</h5>");
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoriteStoriesList.append($story);
    }
  }
  $favoriteStoriesList.show();
}
async function toggleFavorite(evt) {
  console.debug("toggleFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find((s) => s.storyId === StoryId);

  if ($tgt.hasClass("fas")) {
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}
$allStoriesList.on("click", ".star", toggleFavorite);
