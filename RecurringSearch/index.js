const axios = require("axios");
const querystring = require('querystring');

module.exports = async function (context, myTimer) {
    context.log('JavaScript HTTP trigger function processed a request.');

    try {
        
        // -----------------------------------------------------
        // from algolia 2 raindrop

        // let searchs = await getAlgolia();

        // for (let index = 0; index < searchs.hits.length; index++) {
        //     try
        //     {
        //         if (searchs.hits[index].tags === undefined){
        //             await addRaindrop(searchs.hits[index].given_title 
        //                 ,searchs.hits[index].given_url );
        //         }
        //         else
        //         {
        //             await addRaindropTags(searchs.hits[index].given_title 
        //                 ,searchs.hits[index].given_url 
        //                 ,searchs.hits[index].tags.split(",") );
        //         }
        //     }
        //     catch (error) {
        //         context.log('Error getting messages', error.message);
        //     }
        // }

        //----------------------------------------------------------------------

        // -----------------------------------------------------
        // from raindrop 2 algolia

        let searchs = await getRaindropCollections();
        for (let i = 0; i < searchs.items.length; i++) {
        //for (let i = 0; i < 1; i++) {
        
            let raindrops = await getRaindrops( searchs.items[i]._id );
            for (let j = 0; j < raindrops.items.length; j++) {
                await addAlgolia(raindrops.items[j], searchs.items[i]);
            }
            context.log(raindrops);
        }

        context.log(searchs);

        // for (let index = 0; index < searchs.hits.length; index++) {
        //     try
        //     {
        //         if (searchs.hits[index].tags === undefined){
        //             await addRaindrop(searchs.hits[index].given_title 
        //                 ,searchs.hits[index].given_url );
        //         }
        //         else
        //         {
        //             await addRaindropTags(searchs.hits[index].given_title 
        //                 ,searchs.hits[index].given_url 
        //                 ,searchs.hits[index].tags.split(",") );
        //         }
        //     }
        //     catch (error) {
        //         context.log('Error getting messages', error.message);
        //     }
        // }

        //----------------------------------------------------------------------

        context.res = {
            status: 200, /* Defaults to 200 */
            body: "OK"
        };
    }
    catch (error) {
        context.log('Error: ' + error);

        context.res = {
            status: 500,
            body: error.message
        };
    } 
};

async function getAlgolia(  ) {
    try {
        const response = await axios.get('https://M90FC3UY18.algolia.net/1/indexes/oMarks2?hitsPerPage=80&page=4', {
            headers: {
                'X-Algolia-Application-Id': 'M90FC3UY18',
                'X-Algolia-API-Key': '10c0596a79389d1e359ea13707208c4a'
            }
        });

        return response.data;

    } catch (error) {
        console.log('Error post news ', error.message);
    }
}

async function addAlgolia( item , collection) {
    try {
        let config = {
            headers: {
                'X-Algolia-Application-Id': 'M90FC3UY18',
                'X-Algolia-API-Key': '10c0596a79389d1e359ea13707208c4a'
            }
        }
          
        // let data = {
        //     "link": url,
        //     "title": title,
        //     "tags": tags
        // }
        let data = item;
        data.given_title = data.title;
        data.given_url = data.link;
        data.has_image = 1;
        data.image = {};
        data.image.src = data.cover;
        time_read = 0;
        data["facets.tag"] = [collection.title];
        data.tags = data.tags.join(", ");

        const response = await axios.put('https://M90FC3UY18.algolia.net/1/indexes/OMarks4/' + item._id, data, config);

        return response.data;

    } catch (error) {
        console.log('Error post news ', error.message);
    }
}


async function getRaindropCollections(  ) {
    try {
        let config = {
            headers: {
                Authorization: 'Bearer ae04aca4-b502-40c9-bd32-f3830dd717f1',
            }
        }

        const response = await axios.get('https://api.raindrop.io/rest/v1/collections', config);
        return response.data;

    } catch (error) {
        console.log('Error post news ', error.message);
    }
}

async function getRaindrops( collectionid ) {
    try {
        let config = {
            headers: {
                Authorization: 'Bearer ae04aca4-b502-40c9-bd32-f3830dd717f1',
            }
        }

        const response = await axios.get('https://api.raindrop.io/rest/v1/raindrops/' + collectionid, config);
        return response.data;

    } catch (error) {
        console.log('Error post news ', error.message);
    }
}

async function addRaindropTags( title, url, tags ) {
    try {
        let config = {
            headers: {
                Authorization: 'Bearer ae04aca4-b502-40c9-bd32-f3830dd717f1',
            }
          }
          
          let data = {
            "link": url,
            "title": title,
            "tags": tags
        }
          
        const response = await axios.post(`https://api.raindrop.io/rest/v1/raindrop`, data, config);
        return response.data;

    } catch (error) {
        console.log('Error post news ', error.message);
    }
}

async function addRaindrop( title, url ) {
    try {
        let config = {
            headers: {
                Authorization: 'Bearer ae04aca4-b502-40c9-bd32-f3830dd717f1',
            }
          }
          
          let data = {
            "link": url,
            "title": title
        }
          
        const response = await axios.post(`https://api.raindrop.io/rest/v1/raindrop`, data, config);
        return response.data;

    } catch (error) {
        console.log('Error post news ', error.message);
    }
}