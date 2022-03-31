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
        pokemonName: null,
        nextPokemonId: null,
        previousPokemonId: null,

        //PAGE
        filter: 'none',
        limit: 0,
        offset: 0,
        maxOnPage: 20,
        maxPages: 0,

        //DATA
        pokedexLoading: false,
        error: null,

        //REGION
        regions: ['kanto', 'updated-johto', 'hoenn', 'extended-sinnoh', 'original-unova', 'kalos-central', 'updated-alola', 'galar'],
        regionData: [],
        regionDescription: '',
    },
    mounted() {
        let self = this;
        Vue.limit = Vue.maxOnPage;
        setTimeout(self.getAllPokemon, 1);
    },
    methods: {
        //NO FILTER
        async getAllPokemon() {
            let self = this;
            Vue.pokedexLoading = true;

            await $.ajax({
                url: 'https://pokeapi.co/api/v2/pokedex/national',
                success: function(pokemon) {
                    Vue.pokemons = pokemon.pokemon_entries;
                    Vue.maxPages = Vue.pokemons.length;
                    self.fixData('none');
                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Kan pokemon niet laten zien!";
                }
            })
            Vue.pokedexLoading = false;
        },




        //DATA
        fixData(filter) {
            Vue.filter = filter;
            Vue.regionData = '';
            Vue.typeData = '';
            Vue.limit = Vue.maxOnPage;
            Vue.offset = 0;
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

            $.ajax({
                url: 'https://pokeapi.co/api/v2/pokemon/' + Vue.pokemonName,
                success: function(pokemon) {
                    Vue.pokemon = pokemon;
                    Vue.pokemon.entry_number = Vue.pokemon.id;
                    self.replaceStatNames();

                    Vue.nextPokemonId = self.spliceUrl(Vue.pokemons[Vue.pokemon.entry_number].pokemon_species.url);
                    Vue.previousPokemonId = self.spliceUrl(Vue.pokemons[Vue.pokemon.entry_number - 2].pokemon_species.url);

                    $('#pokedex-entry-modal').modal('show');

                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Deze pokemon bestaat niet!";
                }
            })
        },
        setMaxOnPage(result) {
            Vue.maxOnPage = result;
            Vue.offset = 0;
            Vue.limit = result;
        },
        spliceUrl(pokemonUrl) {
            return pokemonUrl.split('/')[6];
        },




        //MODAL
        showPokemon(pokemonId) {
            let self = this;
            1
            $.ajax({
                url: 'https://pokeapi.co/api/v2/pokemon/' + Vue.pokemons[pokemonId - 1].pokemon_species.name,
                success: function(pokemon) {
                    Vue.pokemon = pokemon;
                    Vue.pokemon.entry_number = pokemonId;

                    self.replaceStatNames();

                    if (Vue.pokemon.entry_number < Vue.pokemons.length) {
                        Vue.nextPokemonId = self.spliceUrl(Vue.pokemons[Vue.pokemon.entry_number].pokemon_species.url);
                    }
                    if (Vue.pokemon.entry_number - 2 > 0) {
                        Vue.previousPokemonId = self.spliceUrl(Vue.pokemons[Vue.pokemon.entry_number - 2].pokemon_species.url);
                    }

                    $('#pokedex-entry-modal').modal('show');

                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Kan pokemon niet laten zien!";
                }
            })
        },
        showMoves() {
            $('#pokedex-moves-modal').modal('show');
        },
        previousPokemon(pokemonId) {
            let self = this;
            $.ajax({
                url: 'https://pokeapi.co/api/v2/pokemon/' + Vue.pokemons[pokemonId - 2].pokemon_species.name,
                success: function(pokemon) {
                    Vue.pokemon = pokemon;
                    Vue.pokemon.entry_number = pokemonId - 1;
                    self.replaceStatNames()

                    Vue.nextPokemonId = self.spliceUrl(Vue.pokemons[Vue.pokemon.entry_number].pokemon_species.url);
                    Vue.previousPokemonId = self.spliceUrl(Vue.pokemons[Vue.pokemon.entry_number - 2].pokemon_species.url);

                    if (pokemon.entry_number == Vue.offset) {
                        Vue.previousPage();
                    }
                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Kan niet naar deze Pokemon!";
                }
            })
        },
        nextPokemon(pokemonId) {
            let self = this;
            $.ajax({
                url: 'https://pokeapi.co/api/v2/pokemon/' + Vue.pokemons[pokemonId].pokemon_species.name,
                success: function(pokemon) {
                    Vue.pokemon = pokemon;
                    Vue.pokemon.entry_number = pokemonId + 1;
                    self.replaceStatNames()

                    Vue.nextPokemonId = self.spliceUrl(Vue.pokemons[Vue.pokemon.entry_number].pokemon_species.url);
                    Vue.previousPokemonId = self.spliceUrl(Vue.pokemons[Vue.pokemon.entry_number - 2].pokemon_species.url);

                    if (pokemon.entry_number > Vue.limit) {
                        Vue.nextPage();
                    }

                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Kan niet naar deze Pokemon!";
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

        //REGION
        async selectRegion(region) {
            let self = this;
            Vue.pokedexLoading = true;
            self.fixData('region');
            Vue.url = 'https://pokeapi.co/api/v2/pokedex/' + region;
            await $.ajax({
                url: Vue.url,
                success: function(region) {
                    Vue.regionData = region;
                    Vue.pokemons = region.pokemon_entries;
                    Vue.maxPages = Vue.pokemons.length;
                    self.setRegionDescription(region.descriptions);
                },
                error: function() {
                    Vue.pokedexLoading = false;
                    Vue.error = "Kan regio niet vinden!";
                }
            })
            Vue.pokedexLoading = false;
        },
        setRegionDescription(descriptions) {
            description = descriptions.filter((descriptions) => descriptions.language.name == "en");
            Vue.regionDescription = description[0].description;
        }
    }
})