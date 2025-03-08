var blogURL = "https://dataentrybangla.blogspot.com";
var perPage = 7;
var currentPage = 1;
var totalPosts = 0;

// Check if the current URL is for a Page or a Post
function isPage() {
    return window.location.pathname.includes("/p/"); // Detect Blogger Pages
}

// Fetch Total Number of Posts or Pages
function fetchTotalItems() {
    var feedType = isPage() ? "pages" : "posts"; // Detects whether to load pages or posts

    $.ajax({
        url: blogURL + "/feeds/" + feedType + "/summary?alt=json",
        dataType: "jsonp",
        success: function (data) {
            totalPosts = data.feed.openSearch$totalResults.$t;
            renderPagination();
            fetchItems(currentPage);
        }
    });
}

// Fetch Posts or Pages
function fetchItems(page) {
    var feedType = isPage() ? "pages" : "posts"; // Detect whether to fetch pages or posts
    var startIndex = (page - 1) * perPage + 1;

    $("#loading").show();
    $("#post-container").hide();

    $.ajax({
        url: `${blogURL}/feeds/${feedType}/summary?alt=json-in-script&start-index=${startIndex}&max-results=${perPage}`,
        dataType: "jsonp",
        success: function (data) {
            var container = $("#post-container");
            container.empty();
            var entries = data.feed.entry || [];

            entries.forEach(function (entry) {
                var title = entry.title.$t;
                var link = entry.link.find(l => l.rel === "alternate").href;
                var content = entry.summary ? entry.summary.$t : "No summary available.";

                var postHTML = `
                    <div class="col-md-4">
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title"><a href="${link}">${title}</a></h5>
                                <p class="card-text">${content.substring(0, 100)}...</p>
                                <a href="${link}" class="btn btn-primary">Read More</a>
                            </div>
                        </div>
                    </div>`;
                
                container.append(postHTML);
            });

            $("#loading").hide();
            $("#post-container").show();
        }
    });
}

// Render Pagination
function renderPagination() {
    var totalPages = Math.ceil(totalPosts / perPage);
    var paginationDiv = $("#pagination");
    paginationDiv.empty();

    for (var i = 1; i <= totalPages; i++) {
        var activeClass = i === currentPage ? "active" : "";
        paginationDiv.append(`<li class="page-item ${activeClass}">
            <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
        </li>`);
    }
}

// Change Page
function changePage(page) {
    currentPage = page;
    fetchItems(page);
    renderPagination();
}

// Initial Load
$(document).ready(function () {
    $("#loading").show();
    $("#post-container").hide();
    fetchTotalItems();
});
