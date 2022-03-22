$(document).ready(function() {
    $("#myInput").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $(".dropdown-menu li").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
});

var Vue = new Vue({
    el: '#pokedex-app',
    data: {

        //POKEMON
        pokemons: [],
        pokemon: [],
        indexPokemon: 1,
        moves: 'closed',
        quote: '',
        pokemonName: null,

        //PAGE
        filter: 'none',
        limit: 0,
        offset: 0,
        maxOnPage: 20,
        currentPage: 0,
        maxPages: 0,

        //DATA
        opp: null,
        pokedexLoading: false,

        //REGION
        regions: ['kanto', 'updated-johto', 'hoenn', 'extended-sinnoh', 'updated-unova', 'kalos-central', 'updated-alola', 'galar'],
        regionData: null,
        regionData: [],
        regionDescription: '',

        //TYPE
        types: ['normal', 'fire', 'water', 'grass', 'flying', 'fighting', 'poison', 'electric', 'ground', 'rock', 'psychic', 'ice', 'bug', 'ghost', 'steel', 'dragon', 'dark', 'fairy'],
        typeData: [],
    },
    mounted() {
        let self = this;
        Vue.limit = Vue.maxOnPage;
        setTimeout(self.noFilter, 1);
    },
    methods: {
        //NO FILTER
        async getAllPokemon() {
            Vue.pokedexLoading = true;
            Vue.url = 'https://pokeapi.co/api/v2/pokedex/national';
            await $.ajax({
                url: Vue.url,
                success: function(pokemon) {
                    Vue.pokemons = pokemon.pokemon_entries;
                    Vue.maxPages = Vue.pokemons.length;
                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Error";
                }
            })
            Vue.pokedexLoading = false;
        },
        noFilter() {
            let self = this;
            self.getAllPokemon();
            self.fixData('none');
        },




        //DATA
        addPokemonIndex() {
            this.pokemons.forEach(pokemon => {
                pokemon.id = Vue.indexPokemon;
                Vue.indexPokemon += 1;
            });
        },
        fixData(filter) {
            Vue.filter = filter;
            Vue.regionData = '';
            Vue.typeData = '';
            Vue.regionData = '';
            Vue.typeData = '';
            Vue.limit = 0;
            Vue.offset = Vue.maxOnPage;
        },
        replaceStatNames() {
            i = 0;
            pokemonStats = Vue.pokemon;
            pokemonStatsCaps = pokemonStats.stats.map((stat) => stat.stat.name.charAt(0).toUpperCase() + stat.stat.name.substring(1).toLowerCase());
            specialStatsReplace = pokemonStatsCaps.map((stat) => stat.replace("Special-", "Sp."));

            Vue.pokemon.stats.forEach((stat) => stat.stat.name = specialStatsReplace[i++]);
        },
        searchPokemon() {
            let self = this;
            if (Vue.filter == 'none') {
                pokemonUrl = 'https://pokeapi.co/api/v2/pokemon/' + Vue.pokemonName;
            }

            $.ajax({
                url: pokemonUrl,
                success: function(pokemon) {
                    Vue.pokemon = pokemon;
                    if (Vue.filter == 'region') {
                        self.randomQuote();
                    } else {
                        self.replaceStatNames()
                    }

                    $('#pokedex-entry-modal').modal('show');

                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Deze plaats bestaat niet!";
                }
            })
        },




        //MODAL
        showPokemon(pokemonUrl) {
            let self = this;
            if (Vue.filter == 'none') {
                pokemonUrl = 'https://pokeapi.co/api/v2/pokemon/' + pokemonUrl;
            }

            $.ajax({
                url: pokemonUrl,
                success: function(pokemon) {
                    Vue.pokemon = pokemon;
                    if (Vue.filter == 'region') {
                        self.randomQuote();
                    } else {
                        self.replaceStatNames()
                    }

                    $('#pokedex-entry-modal').modal('show');

                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Deze plaats bestaat niet!";
                }
            })
        },
        showMoves() {
            if (Vue.moves == 'closed') {
                $('#collapseOne').addClass('show');
                Vue.moves = 'open';
            } else {
                $('#collapseOne').removeClass('show');
                Vue.moves = 'closed';
            }
        },
        randomQuote() {
            let quotes = Vue.pokemon.flavor_text_entries.filter((quote) => quote.language.name == 'en');
            quoteIndex = Math.floor(Math.random() * quotes.length);
            Vue.quote = quotes[quoteIndex].flavor_text;
        },
        previousPokemon(pokemon) {
            let self = this;
            $.ajax({
                url: 'https://pokeapi.co/api/v2/pokemon/' + (pokemon.id - 1),
                success: function(pokemon) {
                    Vue.pokemon = pokemon;

                    if (Vue.filter == 'region') {
                        self.randomQuote();
                    } else {
                        self.replaceStatNames()
                    }
                    if (pokemon.id == Vue.offset) {
                        Vue.previousPage();
                    }
                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Deze plaats bestaat niet!";
                }
            })
        },
        nextPokemon(pokemon) {
            let self = this;
            $.ajax({
                url: 'https://pokeapi.co/api/v2/pokemon/' + (pokemon.id + 1),
                success: function(pokemon) {
                    Vue.pokemon = pokemon;

                    if (Vue.filter == 'region') {
                        self.randomQuote();
                    } else {
                        self.replaceStatNames()
                    }
                    if (pokemon.id > Vue.limit) {
                        Vue.nextPage();
                    }

                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Deze plaats bestaat niet!";
                }
            })
        },
        pokemonFirstType() {
            if (Vue.pokemon.types) {
                return Vue.pokemon.types[0].type.name;
            } else {
                return;
            }
        },




        //PAGINA
        openFilter() {
            $('.dropdown-menu').modal('toggle');
        },
        async previousPage() {
            Vue.pokedexLoading = true;
            Vue.limit -= Vue.maxOnPage;
            Vue.offset -= Vue.maxOnPage;
            Vue.pokedexLoading = false;
        },
        async nextPage() {
            Vue.pokedexLoading = true;
            Vue.limit += Vue.maxOnPage;
            Vue.offset += Vue.maxOnPage;
            Vue.pokedexLoading = false;
        },




        //TYPES
        async selectType(type) {
            let self = this;
            Vue.pokedexLoading = true;
            self.fixData('type');
            Vue.url = 'https://pokeapi.co/api/v2/type/' + type;

            await $.ajax({
                url: Vue.url,
                success: function(type) {
                    Vue.pokemons = type.pokemon;
                    Vue.typeData = type;
                    Vue.maxPages = Vue.pokemons.length;
                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "error";
                }
            })
            Vue.pokedexLoading = false;
        },




        //REGION
        async selectRegion(region) {
            let self = this;
            Vue.pokedexLoading = true;
            self.fixData('region');
            Vue.url = 'https://pokeapi.co/api/v2/pokedex/' + region;

            await $.ajax({
                url: Vue.url,
                success: function(region) {
                    Vue.pokemons = region.pokemon_entries;
                    Vue.regionData = region;
                    Vue.opp = '0'
                    Vue.maxPages = Vue.pokemons.length;
                    self.filterDiscription();
                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "error";
                }
            })
            Vue.pokedexLoading = false;
        },
        filterDiscription() {
            let description = Vue.regionData.descriptions.filter((description) => description.language.name == 'en');
            Vue.regionDescription = description[0].description;
        },
    }
})