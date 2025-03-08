var blogURL = "https://dataentrybangla.blogspot.com";
var perPage = 7;
var currentPage = 1;
var totalPosts = 0;

function fetchTotalPosts() {
    $.ajax({
        url: blogURL + "/feeds/posts/summary?alt=json&amp;max-results=0",
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
    $.ajax({
        url: blogURL + "/feeds/posts/summary?alt=json-in-script&amp;start-index=" + startIndex + "&amp;max-results=" + perPage,
        dataType: "jsonp",
        success: function (data) {
            var postsDiv = $("#post-container");
            postsDiv.empty();
            var entries = data.feed.entry || [];

            entries.forEach(function (entry) {
                var title = entry.title.$t;
                var link = entry.link.find(l => l.rel === "alternate").href;
                var content = entry.summary ? entry.summary.$t : "No summary available.";

                var image = ""; // No default image

                if (entry.media$thumbnail) {
                    image = entry.media$thumbnail.url.replace("s72-c", "s600");
                } else if (entry.content) {
                    var contentHTML = entry.content.$t;
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(contentHTML, "text/html");
                    var imgTag = doc.querySelector("img");

                    if (imgTag) {
                        image = imgTag.getAttribute("src");
                    }
                }

                // যদি কোনো ইমেজ না থাকে, তাহলে পোস্টটি appen হবে না
                if (image) {
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
                }
            });
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
fetchTotalPosts();
