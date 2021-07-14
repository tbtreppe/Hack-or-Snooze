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

function generateStoryMarkup(story, showTrashBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const showHeart = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
      ${showHeart ? getHeartHTML(story, currentUser) : ""} 
      ${showTrashBtn ? getTrashBtnHTML() : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}
function getHeartHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const heartType = isFavorite ? "fas" : "far";
  return `<span class="heart">
  <i class="${heartType} fa-heart"></i>
  </span>`;
}

function getTrashBtnHTML() {
  return `<span class="trash-can">
  <i class="fas fa-trash-alt"></i>
  </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story, true);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
async function deleteStory(evt) {
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);
}
$allStoriesList.on("click", ".trash-can", deleteStory);

async function addNewStoriesOnPage(evt) {
  console.debug("addNewStoriesOnPage");
  evt.preventDefault();

  const title = $("#create-title").val();
  const author = $("#create-author").val();
  const url = $("#create-url").val();
  const username = currentUser.username;
  const storyData = { title, author, url, username };

  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story, true);
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
  const story = storyList.stories.find((s) => s.storyId === storyId);

  if ($tgt.hasClass("fas")) {
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}
$allStoriesList.on("click", ".heart", toggleFavorite);
