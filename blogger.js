var blogURL = "https://dataentrybangla.blogspot.com"; 
var perPage = 7;
var currentPage = 1;
var totalPosts = 0;

function fetchTotalPosts() {
    $.ajax({
        url: blogURL + "/feeds/posts/summary?alt=json&max-results=0",
        dataType: "jsonp",
        success: function (data) {
            totalPosts = data.feed.openSearch$totalResults.$t;
            renderPagination();
            fetchPosts(currentPage);
        }
    });
}

function fetchPosts(page) {
    var startIndex = (page - 1) * perPage + 1;

    // Show loading spinner
    $("#loading").show();
    $("#post-container").hide();

    $.ajax({
        url: blogURL + "/feeds/posts/summary?alt=json-in-script&start-index=" + startIndex + "&max-results=" + perPage,
        dataType: "jsonp",
        success: function (data) {
            var postsDiv = $("#post-container");
            postsDiv.empty();
            var entries = data.feed.entry || [];

            entries.forEach(function (entry) {
                var title = entry.title.$t;
                var link = entry.link.find(l => l.rel === "alternate").href;
                var content = entry.summary ? entry.summary.$t : "No summary available.";

                var image = "https://via.placeholder.com/600x400"; // Default Image

                if (entry.media$thumbnail) {
                    image = entry.media$thumbnail.url.replace("s72-c", "s600"); // Better Image Quality
                } else if (entry.content) {
                    var contentHTML = entry.content.$t;
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(contentHTML, "text/html");
                    var imgTag = doc.querySelector("img");

                    if (imgTag) {
                        image = imgTag.getAttribute("src");
                    }
                }

                var postHTML = `
                    <div class="col-md-4">
                        <div class="card mb-3">
                            <img src="${image}" class="card-img-top" alt="${title}" style="height:200px; object-fit:cover;"/>
                            <div class="card-body">
                                <h5 class="card-title"><a href="${link}">${title}</a></h5>
                                <p class="card-text">${content.substring(0, 100)}...</p>
                                <a href="${link}" class="btn btn-primary">Read More</a>
                            </div>
                        </div>
                    </div>`;
                
                postsDiv.append(postHTML);
            });

            // Hide loading spinner and show posts
            $("#loading").hide();
            $("#post-container").show();
        }
    });
}

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

function changePage(page) {
    currentPage = page;
    fetchPosts(page);
    renderPagination();
}

// Initial Load
$(document).ready(function () {
    $("#loading").show(); // Show spinner at start
    $("#post-container").hide();
    fetchTotalPosts();
    $("#loading").hide(); // Show spinner at start
    $("#post-container").show();
});
