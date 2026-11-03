// Exact-source mechanic ownership research, 2026-11-02. No raw rules prose or world IDs.
// Data only: classified does not mean implemented, accepted or executable.
export const NPC_MECHANIC_REVIEW = {
  "by": "codex/unrecorded",
  "date": "2026-11-02",
  "sourceVersion": "3.1.3",
  "method": "Independent exact-source field review in three disjoint batches; all frozen fingerprints matched; original database hashes unchanged; temporary copies removed.",
  "classified": 397,
  "unresolved": 64,
  "limitations": [
    "Classification concerns work ownership only. Every implementation/verification gate remains unresolved.",
    "Kind hints and source annotations never authorize a runtime handler. Browser ID association is not a fingerprint check.",
    "Ambiguous source clauses and unassigned owner associations remain explicit; no inferred outcomes."
  ],
  "batches": [
    {
      "batch": 0,
      "model": "unrecorded"
    },
    {
      "batch": 1,
      "model": "unrecorded"
    },
    {
      "batch": 2,
      "model": "unrecorded"
    }
  ]
};

export const NPC_MECHANICS = [
  {
    "lid": "engiturret_attack",
    "sourceFingerprint": "d17bb627a805ee94c95b3dd485c7d61eb5f0afacb06c24eedeb8a4deeb798163",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Nearest-hostile turret attack: verify range and tier damage"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Engineer-turn timing and nearest eligible hostile selection"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "engiturret_hellstorm",
    "sourceFingerprint": "4721cbd08e84967c2e1cf5fba19edd6ec709e99ff93ea20862b461ceeb5c1bd0",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "area-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Verify Blast1 placement at Range15 and native tier damage"
        ]
      },
      {
        "family": "deployable-target-policy",
        "owningChunk": 6,
        "acceptance": [
          "Restrict firing to Engineer turn and nearest hostile in range"
        ]
      }
    ],
    "unresolved": [
      "Nearest-target tie policy not specified."
    ]
  },
  {
    "lid": "engiturret_hunter",
    "sourceFingerprint": "4f9330c2bb25a8d32b9074334d24a515b2f2159b67f58b20d174ffca3766e589",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "native-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Verify tiered rifle accuracy, damage and Reliable 1 with native outcomes"
        ]
      },
      {
        "family": "deployable-turn-targeting",
        "owningChunk": 6,
        "acceptance": [
          "Use Engineer turn timing and restrict target to nearest eligible hostile"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "engiturret_inferno",
    "sourceFingerprint": "d2fc6ef6ed4265f432cfdd70f504e9feca0970632dfdfd3f994b00558e57ab0a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Cone turret attack: verify cone cells and burn by tier"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Engineer-turn nearest-hostile targeting"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "engiturret_primed",
    "sourceFingerprint": "264096ccdfd61fcf64077ec8db2706e4a77dc8dea6feafcce6f2ac446abaf220",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "destruction-save-damage",
        "owningChunk": 5,
        "acceptance": [
          "Capture destruction of turret or owner once then Agility saves and tier explosion damage"
        ]
      },
      {
        "family": "destruction-area",
        "owningChunk": 4,
        "acceptance": [
          "Verify Burst1 affected tokens after destruction"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcd_climate_node_trait",
    "sourceFingerprint": "28ad43047bbf8c641a2d4f948c8109f469a0c724622636ac3f593d1a3c3958ab",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "deployment-aura-lifecycle",
        "owningChunk": 6,
        "acceptance": [
          "Place one node per PC after deployment, validate linked placement and hard cover, offer immunity inside range, retarget meteor before saves and end graywash after final node"
        ]
      },
      {
        "family": "placement-immunity",
        "owningChunk": 2,
        "acceptance": [
          "Reject all movement of nodes and validate deployment distances"
        ]
      }
    ],
    "unresolved": [
      "Cross-feature meteor and graywash ordering needs joint-source review; this entry alone does not define their entire resolution."
    ]
  },
  {
    "lid": "npcd_flare_drone_trait",
    "sourceFingerprint": "2673745b18d820e90c617cbc5856eadf7c6e8e0cdd27297afacbe56759cf0932",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Deployment requires LOS and range 25; enforce single drone"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Burst 2 light footprint includes entering and starting characters"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Remove and prohibit concealment; owner accuracy bonus; replacement destroys prior drone"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcd_homing_node_trait",
    "sourceFingerprint": "13bb7968476a78e39f8a0cf506b5956d48621b841eb7a05e1e9b8f84e3e097a5",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "adjacent-immunity-aura",
        "owningChunk": 6,
        "acceptance": [
          "Apply linked Climate Node immunity only to adjacent characters"
        ]
      }
    ],
    "unresolved": [
      "Climate Node base immunity clauses require cross-feature review."
    ]
  },
  {
    "lid": "npcd_hound_missiles_trait",
    "sourceFingerprint": "82e7f8be623fb70b5acb2ce587b0c4489605348a65fbbb87676fe327140d0bee",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "homing-deployable-timing",
        "owningChunk": 6,
        "acceptance": [
          "Advance missile on owner turn with Lock On speed change and detonate once on collision"
        ]
      },
      {
        "family": "burst-detonation",
        "owningChunk": 4,
        "acceptance": [
          "Validate Burst 1 affected characters"
        ]
      },
      {
        "family": "saved-damage",
        "owningChunk": 5,
        "acceptance": [
          "Capture Agility save and tier damage or half"
        ]
      }
    ],
    "unresolved": [
      "Direct-route tie breaking and moving-target collision timing require a reviewed policy."
    ]
  },
  {
    "lid": "npcd_jamming_pylon_trait",
    "sourceFingerprint": "6158e536b0c7cd3c53b561a3f9f2c9bb87307344d44fa8f52ef3bb66b92f5aae",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Burst 2 static footprint"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Enemy jam persists only inside zone; pylon survives kit swap"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcd_latch_drone_trait",
    "sourceFingerprint": "92e974d9b4b6fb4e7fc3b6ac8b93eed95df6aeac08c021c4ced8bd6e352a716b",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "attached-occupancy",
        "owningChunk": 2,
        "acceptance": [
          "Represent drone sharing target space and following movement"
        ]
      },
      {
        "family": "turn-healing",
        "owningChunk": 5,
        "acceptance": [
          "Apply tier healing only at attached target turn start"
        ]
      },
      {
        "family": "attached-accuracy",
        "owningChunk": 6,
        "acceptance": [
          "Apply accuracy to checks saves attacks while attached and keep enemy drone targeting"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcd_restock_drone_trait",
    "sourceFingerprint": "226629b0856b6bbf1242b3dad6588b54287057b8dae3bea90891edcad6c6c775",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "consumable-healing-drone",
        "owningChunk": 6,
        "acceptance": [
          "Detect first allied transit or adjacency, heal tier HP once and discharge"
        ]
      },
      {
        "family": "drone-placement",
        "owningChunk": 2,
        "acceptance": [
          "Validate hover deployment within range 5"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcd_scout_drone_trait",
    "sourceFingerprint": "4f3ab9cd5eaa51eccd8cfed6e9cabc049120eac27bd989619b843bd62d48c313",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Free-space Sensors deployment and protocol relocation"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Burst 2 detection footprint"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Concealment denial/removal and owner accuracy bonus"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcd_titan_snare_drone_trait",
    "sourceFingerprint": "28a9fec8f6ffc7f10dfb2a338e0ffb1172efb341ac4b88752fd09cf208b5560f",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "entry-status",
        "owningChunk": 5,
        "acceptance": [
          "Immobilize hostile entrants and turn starters within3 until drone destruction"
        ]
      },
      {
        "family": "drone-placement",
        "owningChunk": 2,
        "acceptance": [
          "Require free adjacent deployment cell"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcd_wolfhound_missile_trait",
    "sourceFingerprint": "e364b1dbd95a48cebe10f955f391080c42be5c4c673c4eb6f1b0604b8289d5be",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "homing-deployable-state",
        "owningChunk": 6,
        "acceptance": [
          "Maintain single missile and prevent recharge before detonation, move on later owner turns"
        ]
      },
      {
        "family": "blast-detonation",
        "owningChunk": 4,
        "acceptance": [
          "Validate Blast 1 and collision"
        ]
      },
      {
        "family": "saved-damage",
        "owningChunk": 5,
        "acceptance": [
          "Capture Agility save and tier damage or half"
        ]
      }
    ],
    "unresolved": [
      "Blast detonation center and alternate-route tie breaking need explicit geometry review."
    ]
  },
  {
    "lid": "npcf_abhorrent_redundancies_horror",
    "sourceFingerprint": "1efcbbf2066012795a59a89142f5a908dfaae50ac686bf0768d10780c92dba59",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Zero-HP trigger and changed repeat threshold"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Native survival roll restores HP and tier overshield only on confirmed success"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_abjure_priest",
    "sourceFingerprint": "71234ce869f711fe16159a78692ce8f0316cfa618e566c92b167b89e78f6d644",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tech-heat-mark",
        "owningChunk": 5,
        "acceptance": [
          "Use Sensors EDefense tech result then tier heat for each target attack until next-turn expiry"
        ]
      },
      {
        "family": "quick-tech-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve quick tech cost"
        ]
      },
      {
        "family": "tier-tech-native-flow",
        "owningChunk": 5,
        "acceptance": [
          "Assert native tier attack initialization against reviewed bonuses2 4 6 and tier overrides."
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_ablative_shielding_scourer",
    "sourceFingerprint": "76c74b439bec94fba34d3de3ad2474d97606761a96180f6ee385fec16c925452",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "damage-resistance",
        "owningChunk": 6,
        "acceptance": [
          "Apply Energy resistance once including when NPC is target"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_abomination_horror",
    "sourceFingerprint": "f941ca5f1c2cab99bedec04330a6c435047692ef9c227b8e78e7581a063d7695",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Scan information restriction applies to eligible target"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_acid_spittle_monstrosity",
    "sourceFingerprint": "a44a2bd32d349b3a1a9c9d5934503ea0242f012bc8d9fde01cc8049f92bbcac3",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "single-ranged-attack",
        "owningChunk": 4,
        "acceptance": [
          "Validate Range10 native tier Energy attack"
        ]
      },
      {
        "family": "on-hit-status",
        "owningChunk": 5,
        "acceptance": [
          "Apply Shredded only after confirmed hit and expire after target next turn"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_acrobat_veteran",
    "sourceFingerprint": "d3d31294d4e84cd3a701f7426b84eacdc82b42fe76a554afff4a7dc60989f7a9",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "movement-followup",
        "owningChunk": 3,
        "acceptance": [
          "Offer three-space flight only after confirmed move or Boost"
        ]
      },
      {
        "family": "flight-exceptions",
        "owningChunk": 2,
        "acceptance": [
          "Validate landing and explicit engagement/reaction exceptions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_active_camo_spec_op",
    "sourceFingerprint": "c587ae065ba7f50db1f22931d8ce65f8917e583969c271e59ea306f09dab9ae6",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Protocol and limited charge reservation"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Next-turn invisibility expiry and next-hit critical conversion"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_adapt_evade_disengage_hornet",
    "sourceFingerprint": "a13747a723e20e538e45b44a83e9247c0bfdc8a8c94eef3a77ddb1e772fb36e5",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "grapple-immunity",
        "owningChunk": 6,
        "acceptance": [
          "Reject Grapple against Hornet"
        ]
      },
      {
        "family": "engagement-exception",
        "owningChunk": 2,
        "acceptance": [
          "Ignore engagement in movement legality"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_adaptive_shielding_aegis",
    "sourceFingerprint": "8bf3d1b7f2f6b046bfbf2a9ec4c02e1fd27ba988926ade0d115bd9a96fcbd908",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "damage-triggered-aura",
        "owningChunk": 6,
        "acceptance": [
          "First damaged net ally each round establishes damage-type resistance for all net allies until Aegis next-turn end"
        ]
      }
    ],
    "unresolved": [
      "First-damage event carrying several damage types does not specify resistance selection."
    ]
  },
  {
    "lid": "npcf_adhesive_secretions_monstrosity",
    "sourceFingerprint": "c63eaebfba2703b2d8ee36df7f8226c91a14a9ed043a95301de2edf5d27404f5",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "First damaged target each turn and healing/scene expiry"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Confirmed Engineering save controls Slowed"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_advanced_kit_ultra",
    "sourceFingerprint": "bc91bac8056634c9a50a0bb8b370f3de51a1c0814e2f6c2a09f5703b4e560ef0",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "template-loadout",
        "owningChunk": 6,
        "acceptance": [
          "Validate one or two extra class optional systems without treating selection as turn action"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_aggression_berserker",
    "sourceFingerprint": "00d792a8b2e5aa91191690e24013573cf3ec09cd032c2fababd7356e6244f286",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "damage-triggered-attack",
        "owningChunk": 6,
        "acceptance": [
          "Trigger only first damage per round"
        ]
      },
      {
        "family": "native-random-choice",
        "owningChunk": 5,
        "acceptance": [
          "Capture authoritative random adjacent ally-or-hostile choice"
        ]
      },
      {
        "family": "mandatory-attack",
        "owningChunk": 4,
        "acceptance": [
          "Resolve Chain Axe attack without inventing target or outcome"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_ambushers_squad",
    "sourceFingerprint": "2fc8b2de52f3a84c5a75bb303a0634fe3f85bb048da581831e60ad8b58f1ca26",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "First-round accuracy applies to attacks saves and checks"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_anti_armor_weapon_human",
    "sourceFingerprint": "0e15774a22f86e1f6501f9de9c7bf7e08d9113f9e9f4382a71f26aa8b992c5b6",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "variable-damage-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Validate Range8 tier damage and confirmed native damage type"
        ]
      }
    ],
    "unresolved": [
      "Source uses Variable damage with no selection rule."
    ]
  },
  {
    "lid": "npcf_anti_armor_weapon_squad",
    "sourceFingerprint": "725bf74385901b515502fd2432904facdc2de99ea2b19e32223e05bb3d6eabfd",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "native-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Verify AP heavy cannon tier statistics and explicit Variable damage-type input"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_anti_materiel_rifle_sniper",
    "sourceFingerprint": "078271659d7774621f70fd60346dffef5ba126ee587280badd4f78d38682176a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Superheavy action cost; loading and ordnance availability"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Range 25 rifle with tier damage accuracy and armor piercing"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_argus_armor_ultra",
    "sourceFingerprint": "36b16b25bcb38ae616182856c9131067e02e8540d1cbe9e650eb8b0ad4cd2baa",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "degrading-armor",
        "owningChunk": 6,
        "acceptance": [
          "Start at Armor6 and lose2 per observed structure or overheating check with floor0"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_armored_hull_ship",
    "sourceFingerprint": "11987bdc3a2d9584486281286380e8470c1cd321db691feed791b5044bd2b946",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "template-stat-bonus",
        "owningChunk": 6,
        "acceptance": [
          "Verify plus-five HP already included in actor data and avoid duplicate application"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_armored_human",
    "sourceFingerprint": "e331d17b8176fcc95186b4c3075fb4d0f5b84f8e6a045735e770546d2ac2a3a5",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Armor increase must avoid doubling actor-computed stats"
        ]
      }
    ],
    "unresolved": [
      "Source gives armor range without selecting exact value"
    ]
  },
  {
    "lid": "npcf_armored_squad",
    "sourceFingerprint": "991dcfba4b3e0c770125fec89dbcd2b4bd294e969cb674a84b7df1abc38b30d8",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "armor-bonus",
        "owningChunk": 6,
        "acceptance": [
          "Apply one Armor increase without duplicate addition"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_arsenal_engineer",
    "sourceFingerprint": "f0d6d96b12c6a822df150a382ff272b8de6d19518fef350cd961c5ead6810430",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "deployable-modification",
        "owningChunk": 6,
        "acceptance": [
          "Persist chosen turret variant including destruction linkage"
        ]
      },
      {
        "family": "weapon-area-variants",
        "owningChunk": 4,
        "acceptance": [
          "Validate Inferno Cone 3 and Hellstorm ranged Blast 1"
        ]
      },
      {
        "family": "death-save-damage",
        "owningChunk": 5,
        "acceptance": [
          "Resolve Primed Burst save and tier damage from actual destruction"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_artificial_horror",
    "sourceFingerprint": "4c997217a8d917cf1b8d2d07594a7ece0bc0a0865a46a6cad84f977416900168",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Biological prerequisite then type replacement and heat-cap override"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_assassins_mark_assassin",
    "sourceFingerprint": "683a9296a730ebf2f4fc7cc597ad83015b1899e71bc334faa0fe3f3ae4ca60cd",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "mark-activation",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action and require visible target"
        ]
      },
      {
        "family": "target-linked-modifiers",
        "owningChunk": 6,
        "acceptance": [
          "Track scene mark damage resistance irreducible outgoing damage and save accuracy"
        ]
      },
      {
        "family": "mark-replacement",
        "owningChunk": 6,
        "acceptance": [
          "Allow replacement only after marked target destruction"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_assimilaiton_maw_horror",
    "sourceFingerprint": "ad7d0aa4b261cf2450c997b6257829b5daece5a354f668fadf4d9e8bb2274e19",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "superheavy-auto-hit",
        "owningChunk": 4,
        "acceptance": [
          "Validate full action, automatic ally and wreck hits, and native tier damage"
        ]
      },
      {
        "family": "post-attack-save-healing",
        "owningChunk": 5,
        "acceptance": [
          "Check post-damage half-HP threshold before Hull save and heal only from confirmed destruction or wreck hit"
        ]
      },
      {
        "family": "wreck-lifecycle",
        "owningChunk": 6,
        "acceptance": [
          "Remove hit wreck once"
        ]
      }
    ],
    "unresolved": [
      "Automatic wreck hit and destruction must be reconciled with actor/object native flows."
    ]
  },
  {
    "lid": "npcf_atlas_missiles_rainmaker",
    "sourceFingerprint": "be531979eafa89c834c3db8ac43d4ff2184160fa787115c8cc8e34de7c36e355",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Full-action recharge availability"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Ground LOS range30 placement and Blast2"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Detonation delayed until next round end"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Agility save determines tier damage halving"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_auto_targeting_assault",
    "sourceFingerprint": "8b0e7c8be0f2349b647e06894b757fa7ee5083663062b7855a184336e5f322d0",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "cover-exception",
        "owningChunk": 6,
        "acceptance": [
          "Remove attack cover penalties while retaining LOS requirement"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_automated_battlefield_awareness_node_spec_op",
    "sourceFingerprint": "b4e03886d39b236cd5209d45c18281d769e4395d28c1e37bc124e20b7631c90a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "save-interception",
        "owningChunk": 7,
        "acceptance": [
          "Offer automatic save success before dice for allied Spec Ops within range 8 and LOS with unlimited per-round uses"
        ]
      },
      {
        "family": "combat-unique-system",
        "owningChunk": 6,
        "acceptance": [
          "Reject more than one carrier per combat"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_avalanche_charge_berserker",
    "sourceFingerprint": "747bbdda1d0b5ccd5712b6131bc5e4fb937648c228808a1d1b90d0e97d94de0e",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Quick recharge movement limited by Speed and straight path"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Move precedes attack; native random adjacent selection"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Chain Axe attack includes allied adjacent targets"
        ]
      },
      {
        "family": "reaction-trigger-and-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Movement bypasses engagement reactions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_barrel_roll_ace",
    "sourceFingerprint": "98cc20df47e5a81f5e61475f19db8ba3dc961e18c36611de1e25948069848c07",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "hit-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Trigger only confirmed melee or ranged hit and replace its outcome before damage"
        ]
      },
      {
        "family": "reaction-flight",
        "owningChunk": 2,
        "acceptance": [
          "Validate6-space flight no engagement or reactions and recharge5 availability"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_best_of_the_best_ultra",
    "sourceFingerprint": "ada1404032a32ad1bf8519b35f7338a1725feb357e1add895fbeb88310aefd04",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "template-incompatibility",
        "owningChunk": 6,
        "acceptance": [
          "Reject Elite or Grunt combined with Ultra"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_blind_witch",
    "sourceFingerprint": "dc623c25538b4bcb6c05d6e1858230b9c122362315a53e4087032b0f0a085462",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Quick-tech recharge Sensors target legality"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Native tech hit gates adjacent-only LOS effect"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "LOS restriction expires at target next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_blinding_shells_archer",
    "sourceFingerprint": "70693905a9aa97bb75dd2a57bf95f848dea2bdafddaaef4304cf5a5f83664fca",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "round-counter",
        "owningChunk": 2,
        "acceptance": [
          "Limit blinding use to once each round"
        ]
      },
      {
        "family": "post-hit-save",
        "owningChunk": 5,
        "acceptance": [
          "Capture Engineering save after successful attack"
        ]
      },
      {
        "family": "restricted-los",
        "owningChunk": 6,
        "acceptance": [
          "Restrict failed target LOS to adjacent spaces until next-turn expiry"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_blinkspace_carver_exotic",
    "sourceFingerprint": "f3014615c29aac4d0c413a23b5022f305e81b4734efe895476f361b3b1e0ec0b",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "teleport-movement",
        "owningChunk": 2,
        "acceptance": [
          "Replace movement path with legal teleport destinations and verify range and footprint"
        ]
      },
      {
        "family": "movement-mode",
        "owningChunk": 6,
        "acceptance": [
          "Apply teleport modifier to all applicable move uses"
        ]
      }
    ],
    "unresolved": [
      "Movement teleport exceptions for terrain and intermediate triggers require movement-rule cross-review."
    ]
  },
  {
    "lid": "npcf_blip_mirage",
    "sourceFingerprint": "97c3de996710667a45315a063222b6b04a9b782dfe01dd4b84499ba28b59ae5d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "reaction-trigger-and-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Hostile action in LOS trigger and once-round availability"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Allied Sensors-target teleport up to five spaces"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_blur_witch",
    "sourceFingerprint": "4b344d9040dad58b26c63a6c247ed54ea23cefd347068b911b2bc83e020527f2",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "turn-invisibility",
        "owningChunk": 6,
        "acceptance": [
          "Enable Invisible only during Witch active turn"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_boarding_leash_pirate",
    "sourceFingerprint": "fce5a655f2d8dd1f2f6269bd30cd6355d97998ada73a1c91fe1083b00a9f7251",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "thrown-melee-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Validate Threat 1 and Thrown 5 modes with native tier attacks"
        ]
      },
      {
        "family": "save-pull-grapple",
        "owningChunk": 5,
        "acceptance": [
          "Capture failed Hull save before direct pull and automatic Grapple"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_bodyguard_sentinel",
    "sourceFingerprint": "a083ba47d8e7528c4f7651134da5ae8ee553914ce3eb1a46b272e6bdb4e5c954",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Protocol chooses allied ward within five"
        ]
      },
      {
        "family": "reaction-trigger-and-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Ward assignment grants linked Reflexive Blow reaction"
        ]
      }
    ],
    "unresolved": [
      "Protocol and reaction tags coexist; do not infer activation from tag alone"
    ]
  },
  {
    "lid": "npcf_bolster_network_commander",
    "sourceFingerprint": "28b06eec57235815193a285359055a5e38d1adeb5063c4b1351502ab6e161eb4",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "visible-allied-aura",
        "owningChunk": 6,
        "acceptance": [
          "Apply Systems-save accuracy and incoming-tech difficulty to visible allies excluding Commander"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_bombard_cannon_bombard",
    "sourceFingerprint": "0727cb132766702ab03563e30b9c9f8b3f57c60bd7a641e02b09464f264c0fea",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "ranged-blast-superheavy",
        "owningChunk": 4,
        "acceptance": [
          "Validate range 25 Blast 2, Arcing and tier accuracy and damage"
        ]
      },
      {
        "family": "ordnance-cost",
        "owningChunk": 2,
        "acceptance": [
          "Validate full action and Ordnance timing"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_bombing_bay_ace",
    "sourceFingerprint": "6d6ad07b85b97b162e2fc0dd50da222d472955e478bc3a77569b9daad39d2a9e",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Limited free-action once-round flying-movement prerequisite"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Blast1 must overlap chosen target below or beside path"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Agility save gates tier explosive damage and Prone"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_bonus_hp_rpv",
    "sourceFingerprint": "b0abacbcbcc662c7f29698831713c2200b557cf77e60a36889aa789c47a7992a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "hp-template-bonus",
        "owningChunk": 6,
        "acceptance": [
          "Apply HP+5 once and retain RPV cockpit exception"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_bounty_hunter_mercenary",
    "sourceFingerprint": "3b706ffe1e69d862a39c3a33b02b8ae191da6038a04bfcc95ca6d70b86446738",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "designated-target-bonus",
        "owningChunk": 6,
        "acceptance": [
          "Store precombat GM-selected PC and apply Accuracy to matching attacks checks and saves for all Mercenaries"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_breach_ram_breacher",
    "sourceFingerprint": "ea8bb682428b3030767305c67d78a01892e9b96e692310dcad45cc7bb779c942",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Quick recharge straight-six movement with pass-through but no occupied endpoint"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Destroy obstruction before continuing movement"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Tier AP object damage and Agility-save displacement with Prone"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_break_armor_breacher",
    "sourceFingerprint": "895f8ce7dc6dadff89810e217ab16860bb0bdad9a74edc544fced595329f2d9d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "per-target-hit-history",
        "owningChunk": 6,
        "acceptance": [
          "Count successful Dual Shotgun hits per turn and apply scene Shredded only on second hit"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_broad_sweep_haft_demolisher",
    "sourceFingerprint": "fcc5886b22fd1533142edca0b84ffacdc93634eaa5f51b81c831688dd220aae2",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "selective-burst-attacks",
        "owningChunk": 4,
        "acceptance": [
          "Validate chosen characters in Burst 2 and native melee attacks with tier explosive damage"
        ]
      },
      {
        "family": "on-hit-condition",
        "owningChunk": 5,
        "acceptance": [
          "Apply Impaired only on hit and expire at target next-turn end"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve full action instead of two quick actions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_bulky_construction_industrial_mech",
    "sourceFingerprint": "60cd00ab4b3bc96c7c75e1eba6d8d5abafdc61ae71572cdae4643da6735fd150",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Boost becomes full action"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Armor bonus must not duplicate actor-computed stat"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_bulwark_mods_barricade",
    "sourceFingerprint": "61f510935b576795204e971705ceaed8698f22f85ca63f5be8116fce81f624a2",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "terrain-cost-exception",
        "owningChunk": 2,
        "acceptance": [
          "Ignore difficult and dangerous terrain for Barricade only"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_bulwark_mods_spec_op",
    "sourceFingerprint": "4a6fb5fc9b7f269d986557bdb8a3d02744658a3d1a490e77efe321780e1d499b",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "terrain-exception",
        "owningChunk": 2,
        "acceptance": [
          "Permit difficult and dangerous terrain without normal penalties"
        ]
      },
      {
        "family": "movement-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Apply exception while Spec Ops acts as mover"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_bunker_buster_bombard",
    "sourceFingerprint": "bc35493308a0fff9cc920fcd09d522d7c627effb839e357121fe1a982046a0eb",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Bombard area identifies objects and terrain"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Apply tier AP explosive object damage without attack roll"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_burrower_monstrosity",
    "sourceFingerprint": "d5e6ec5d9840d543941ce01838e68d450d4416d1804b2392dd65953b0b3b0d38",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "burrow-mode-legality",
        "owningChunk": 2,
        "acceptance": [
          "Restrict burrowed actions to move Boost emergence and require free emerge cell"
        ]
      },
      {
        "family": "emergence-save",
        "owningChunk": 5,
        "acceptance": [
          "Resolve adjacent Hull saves and failed Prone"
        ]
      },
      {
        "family": "burrow-state",
        "owningChunk": 6,
        "acceptance": [
          "Apply invisibility and passage exception only while burrowed"
        ]
      }
    ],
    "unresolved": [
      "Sufficiently malleable surface requires authoritative GM terrain input."
    ]
  },
  {
    "lid": "npcf_burst_jets_spec_op",
    "sourceFingerprint": "fa3705f96e0a9199f25c11ac2bdb0c2f5dafd9c201788ade041c05b0089dcd91",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "boost-flight",
        "owningChunk": 2,
        "acceptance": [
          "Allow flight only on Boost and require solid landing surface or confirmed falling resolution"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_buzzsaw_industrial_mech",
    "sourceFingerprint": "c5c07f09ffc05ef40da510daa31dc74b3afef7d33f7c848dce786328cba02d97",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Tier melee attack and doubled base damage only on confirmed critical"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_capacitor_discharge_cataphract",
    "sourceFingerprint": "51c7b3c1b966c609fd64709f95cd748003bd6ae1dcb37d549c3b1e2bd9e71d5d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "conditional-resistance",
        "owningChunk": 6,
        "acceptance": [
          "Enable Energy and heat resistance unless Slowed or Immobilized"
        ]
      },
      {
        "family": "turn-end-heat",
        "owningChunk": 5,
        "acceptance": [
          "Apply tier heat to each adjacent character at turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_carbon_fiber_sword_ronin",
    "sourceFingerprint": "9094ed99bf76005cc4d4615d95df691e9c6a09d6b6d9eb5b882f4afc95cd75cc",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tiered-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Validate one two or three sword attacks by tier with split targets and native critical bonus"
        ]
      },
      {
        "family": "attack-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Do not execute later sword attacks after unresolved or cancelled first attack"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_career_soldier_elite",
    "sourceFingerprint": "53f77e8f9c41207b3b71cec6d5d6f0c6f2e20cf2df0e4b68b20da9be7c4b6b89",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Reject Elite with Grunt or Ultra template"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_chaff_grunt",
    "sourceFingerprint": "c09efc81d4f83ff76e2ca2ae179e8f8996770afa5b43804f26f3c5d419184c0d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "grunt-hp-and-save",
        "owningChunk": 6,
        "acceptance": [
          "Cap HP at1 and prevent successful-save damage across all sources"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_chaff_launchers_ace",
    "sourceFingerprint": "3166e9fbda7d0181f5e3a981007e657c4dd6740d582ace394fea8c3de0df102f",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "reaction-modifier",
        "owningChunk": 6,
        "acceptance": [
          "After confirmed Barrel Roll grant soft cover until next-turn end and allow tech attacks as triggers"
        ]
      },
      {
        "family": "expanded-trigger",
        "owningChunk": 7,
        "acceptance": [
          "Offer Barrel Roll for native tech attack events"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_chaff_launchers_ronin",
    "sourceFingerprint": "ac2081fabd190ee42923b49cbe79f618070b2c1c83fd182d456f7507fa642c48",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Boost grants soft cover until next-turn start"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_chain_axe_berserker",
    "sourceFingerprint": "f4d3aa796b7a2c5af3b7e3954b055fe9ca08798a05f932977f374d1c5e2dcc48",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "melee-attack",
        "owningChunk": 4,
        "acceptance": [
          "Validate Threat1 tier native damage"
        ]
      },
      {
        "family": "critical-status",
        "owningChunk": 5,
        "acceptance": [
          "Apply timed Shredded only from observed critical"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_chain_witch",
    "sourceFingerprint": "b4f1fbef1fd09faf487f8d51b8fc121e8f989904e9c66e88b069dc1b40303afd",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tech-chain",
        "owningChunk": 5,
        "acceptance": [
          "Resolve Sensors tech hit, chosen anchor within range 3 and heat plus Jammed when target crosses threshold"
        ]
      },
      {
        "family": "chain-lifecycle",
        "owningChunk": 6,
        "acceptance": [
          "Track voluntary or involuntary crossing and end on source stun destruction or scene end"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve quick-tech action cost"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_charge_cataphract",
    "sourceFingerprint": "e270f360fe3604e176e4de1f7ed5baf40ff35afbdb40fca888ed4d088f6f8746",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge quick straight-Speed move"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Move then range-valid Ram Cannon attack"
        ]
      },
      {
        "family": "reaction-trigger-and-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Charge ignores engagement and movement reactions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_charged_slash_ronin",
    "sourceFingerprint": "d5a3242c7647ef1a46a744619b55139026903644870b29e5a47671901aa49a98",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "full-recharge-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve full action and recharge5"
        ]
      },
      {
        "family": "adjacent-save-damage",
        "owningChunk": 5,
        "acceptance": [
          "Resolve every adjacent character Agility save with tier full or half damage"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_chronotorus_exotic",
    "sourceFingerprint": "5f8b0bc750db247c4dfa3b0345af73a2d9da80949a15cd63ee6c31090743432f",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "d20-reroll-interception",
        "owningChunk": 7,
        "acceptance": [
          "Offer reroll on actual visible d20 event once per round and keep authoritative new result"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Enforce per-round use maximum and refresh exactly once: 1"
        ]
      }
    ],
    "unresolved": [
      "Timing against finalized d20-dependent effects needs a verified native interception boundary."
    ]
  },
  {
    "lid": "npcf_civilian_machine_industrial_mech",
    "sourceFingerprint": "a6b95a5e7c140c3365b1637c67d23920e62b63df72a12cc38d78f67d9a968f1d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Difficulty to own checks/saves and tech accuracy against target"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_claws_monstrosity",
    "sourceFingerprint": "3231d15f3431444a217f461c1995cdb0cf08b2e2c779b8ea3865a2b4f28f919d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "melee-attack",
        "owningChunk": 4,
        "acceptance": [
          "Validate Threat1 tier damage accuracy and attack bonus"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_climber_sniper",
    "sourceFingerprint": "995de12e1765a8fdddd0f29ec1392afb74fc482cb267655462bafb6ea4347c71",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "surface-movement",
        "owningChunk": 2,
        "acceptance": [
          "Validate vertical and overhanging climb and stationary surfaces without ordinary penalties"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_cloaking_field_scout",
    "sourceFingerprint": "1b812c8116b605e5811b4580ba88dc6dc226a030ba87b774593198ca4906db4b",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge quick activation"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Burst3 allied cloak membership"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Invisibility and self immobilization expire next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_cloud_projector_assassin",
    "sourceFingerprint": "5259362a6f73822a155712533eec9fc90695da42b3e127bbd3935825e72174fd",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "concealment-area",
        "owningChunk": 4,
        "acceptance": [
          "Verify Burst3 full versus partial token containment"
        ]
      },
      {
        "family": "smoke-los-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Apply Assassin soft cover and asymmetric boundary LOS exception until next turn or replacement"
        ]
      },
      {
        "family": "quick-recharge-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action and recharge5"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_cluster_munitions_bombard",
    "sourceFingerprint": "fe27ec54ca98ce4c4fbe7586cd7b8db816e44277cf662ca0ea384f7757740c50",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "multi-target-damage-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Count actual attack targets beyond first and add tier bonus to every target"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_cluster_seeker_bombs_bombard",
    "sourceFingerprint": "60b03dea06e2816dacb00ca1448f216f12fcb4319e469ab9ccdb8469e9d3722e",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Select three characters within three of Bombard target space"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Tier explosive damage occurs regardless of hit"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_combat_knife_assault",
    "sourceFingerprint": "0a6bd55cd30cd4215f5785d090cad745e82231db10fa9ceeb99220917f182574",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "auxiliary-melee",
        "owningChunk": 4,
        "acceptance": [
          "Validate Threat1 and native tier damage"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_combat_shotgun_sentinel",
    "sourceFingerprint": "7dbce8970ee5e13adeeb4ed19b970d72a5bfceaa940fcb5a37c5823f57fd7947",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "native-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Verify ranged and Threat modes, tier hit modifiers and kinetic damage through native attack"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_commander_traits_commander",
    "sourceFingerprint": "30afad9f7e058d070335d241827f9b272b1aea1575d007758f0dd046e04103ce",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "One selected Commander option disabled by Jammed"
        ]
      }
    ],
    "unresolved": [
      "Referenced Commander Traits list and selected option require linked review"
    ]
  },
  {
    "lid": "npcf_concussion_gun_spacer",
    "sourceFingerprint": "c131b4b04876dbdcc775c0079bddba48ffab846b9dbd040e2e215a6d7df14655",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "cone-attack",
        "owningChunk": 4,
        "acceptance": [
          "Verify Cone3 targets and native attack"
        ]
      },
      {
        "family": "knockback",
        "owningChunk": 5,
        "acceptance": [
          "Resolve Knockback3 from confirmed result"
        ]
      }
    ],
    "unresolved": [
      "Source has no damage profile; do not invent one."
    ]
  },
  {
    "lid": "npcf_concussion_missiles_demolisher",
    "sourceFingerprint": "c79d2cb3afca6f88d8f6a8b25f63c4768f5031d1ae6da640915b62c8cf8bea1e",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "multi-target-save-condition",
        "owningChunk": 5,
        "acceptance": [
          "Select characters within LOS and range 5, capture Hull saves and expire Slowed plus Impaired at target next-turn end"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve one quick action"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_construction_tools_industrial_mech",
    "sourceFingerprint": "ae05f92ef1021d51d305e5f15b993b6f10c01040966fc4651a91e61fabd1b1e4",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Weapon-choice list and second-choice base weapon replacement"
        ]
      }
    ],
    "unresolved": [
      "Referenced Industrial Weapons list requires linked review"
    ]
  },
  {
    "lid": "npcf_cooling_module_scourer",
    "sourceFingerprint": "0627ac671a2de09cfc0115bada162c6e4c72ff4e61ca8aef6354c5de786d6883",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "movement-history",
        "owningChunk": 6,
        "acceptance": [
          "Track all movement including forced since previous turn end"
        ]
      },
      {
        "family": "conditional-heat-clear",
        "owningChunk": 5,
        "acceptance": [
          "Clear heat at turn start only when movement history is empty"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_coordinated_carnage_spec_op",
    "sourceFingerprint": "e932ae80ad7933466180bbe4403ead158186c6e46007ddbdc2719761edf1f315",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "extra-turn-timing",
        "owningChunk": 6,
        "acceptance": [
          "After all Spec Ops turns offer exactly one chosen extra turn in normal order"
        ]
      },
      {
        "family": "activation-budget",
        "owningChunk": 2,
        "acceptance": [
          "Initialize separate turn budget without changing per-round counters"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_coreworm_rockets_pirate",
    "sourceFingerprint": "efa1ded26b638f49cc38a3f7343dc8a230477dfa405c3e5193ad36b2f8e29e69",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Limited full-action LOS range10 targeting and adjacent remover quick actions"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Native drone-count and timer rolls; confirmed Systems/Engineering removal checks; pilot HP outcome"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Per-drone state and countdown paused during Shutdown"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_corrosive_bite_monstrosity",
    "sourceFingerprint": "60c6720082b296014c762f649f5557be175b46f1e14060fbe89881ee3a75ffd2",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "full-recharge-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge full action and recharge5"
        ]
      },
      {
        "family": "save-burn-shred",
        "owningChunk": 5,
        "acceptance": [
          "Resolve adjacent Hull save for tier Burn and apply Shredded regardless of save until any HP recovery"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_covering_fire_archer",
    "sourceFingerprint": "c92dee7b7dfb92fbb36d3bbf46f63a3c466ca231c98d179dcc5f9252d231a08a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "designated-blast-zone",
        "owningChunk": 4,
        "acceptance": [
          "Validate Blast 3 zone within range 10 and LOS"
        ]
      },
      {
        "family": "granted-reaction",
        "owningChunk": 7,
        "acceptance": [
          "Grant Got Your Back only for active designated zone"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 4",
          "Reserve one quick action"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_crew_ship",
    "sourceFingerprint": "1770e556d10d50b86e7438fdf9f445b73fdb13d15897cf1041d81e4f63bd950d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Ship crew minimum and actor membership representation"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_crew_vehicle",
    "sourceFingerprint": "ad056065010c441895a4609c33928f4aeb38dd67c99bc650c1f1f8ef20183b1a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "vehicle-crew",
        "owningChunk": 6,
        "acceptance": [
          "Record optional crew and minimum crew count from vehicle Size"
        ]
      }
    ],
    "unresolved": [
      "Crew rounding and combat consequences unspecified."
    ]
  },
  {
    "lid": "npcf_crush_targeting_goliath",
    "sourceFingerprint": "ba0254996f7fc1b3d5b86e9d67b734be8efa2ab79d9f9a9224c90060943d0b9b",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "targeted-tech-modifier",
        "owningChunk": 5,
        "acceptance": [
          "Validate Sensors and LOS and apply three Difficulty only against non-Goliath attack targets until source next-turn start"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 4",
          "Reserve quick-tech action cost"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_crushing_embrace_goliath",
    "sourceFingerprint": "23eb24aa0c00da8096cf7fd46d5014996d3f3eff6bcc75e5b6c5a1fd16e32d70",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Adjacent target and one-grapple limit"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Agility save controls grapple and grapple-linked Jammed"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_dark_cloud_witch",
    "sourceFingerprint": "eee968c28fa302bbb83f20b457086b7c2c93b9eb3b8b28c9e6521a07458d75e9",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "linked-heat-override",
        "owningChunk": 6,
        "acceptance": [
          "For Tear Down delayed heat use7 only when target in Danger Zone"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_dataveil_mirage",
    "sourceFingerprint": "852cfad8500cb25011cdef99f4aed431b6d2982ccc6187b6281032553adc6e17",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "transfer-condition",
        "owningChunk": 5,
        "acceptance": [
          "Transfer Invisible as quick action with LOS, restore source when transferred back and observe destruction end"
        ]
      },
      {
        "family": "exclusive-status-ownership",
        "owningChunk": 6,
        "acceptance": [
          "Track current recipient so Invisible is not duplicated"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_dataveil_scout",
    "sourceFingerprint": "c5a28490e0aa20ef201c03b6262fc7f502d425d7b85c990ea952566166852a54",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Quick action LOS transfer eligibility"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Default invisibility transfer ownership and destruction expiry"
        ]
      }
    ],
    "unresolved": [
      "Transfer-to-another-character sentence leaves return-to-Scout status timing ambiguous"
    ]
  },
  {
    "lid": "npcf_deadliest_game_monstrosity",
    "sourceFingerprint": "c468fa2324d542648efacee9a036fce9c0cd103a25499c09f9d1661706cf3459",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "mutation-loadout",
        "owningChunk": 6,
        "acceptance": [
          "Require at least one optional mutation in Monstrosity configuration"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_deadly_pirate",
    "sourceFingerprint": "075e0bac07fbdd4b500777531a0a0f65616dd051a6f6da5d9e81553657fae4c8",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "critical-damage-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Add one native d6 bonus only on confirmed critical hit"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_deadly_precision_spec_op",
    "sourceFingerprint": "c889c5322c85bb44f89cdaa9e69390eb59a514d610b218798dacdad16bc29e66",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Tier bonus damage applies only to critical hits"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_deadly_ultra",
    "sourceFingerprint": "1021f899f2d8ea7d52db02a4c0782f7f59e8bd4bf3623b6e0720f82d7b03a792",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "critical-damage-bonus",
        "owningChunk": 6,
        "acceptance": [
          "Add native1d6 damage only to confirmed criticals"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_deadly_veteran",
    "sourceFingerprint": "048cdbc70301aecbcd6badca1397fa9eeca4308eab235c222fe5c93f7c14e772",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "critical-damage-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Add one native d6 bonus only on confirmed critical hit"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_deadmetal_rounds_sniper",
    "sourceFingerprint": "a77cf998573e4a801daa575894f52044cef9156481b8a7ddebfa5c121a004bb5",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Quick preparation cost"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Next Anti-Materiel attack uses Line20 geometry"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Consume prepared round on next attack"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_deathcounter_bastion",
    "sourceFingerprint": "98cf40720e0e6cf1161eec7bf3590b9a7824e220acd3b4c24189e897cc618665",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "first-hit-shield",
        "owningChunk": 6,
        "acceptance": [
          "Reduce first successful melee or ranged hit damage to0 each round and retain consumed state"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_defense_net_aegis",
    "sourceFingerprint": "01a8dc9f732596670f3222baa358185a5a0fc49116ccfb751f4be37815570ea4",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "defensive-aura",
        "owningChunk": 6,
        "acceptance": [
          "Track moving Burst 3 net, outside-origin difficulty and critical prevention, ally immunity and entry cleansing, source Immobilized and termination"
        ]
      },
      {
        "family": "protocol-deactivation",
        "owningChunk": 2,
        "acceptance": [
          "Permit protocol ending and verify full-action activation"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 4",
          "Reserve full action instead of two quick actions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_defensive_grapple_sniper",
    "sourceFingerprint": "9b5972e6dfab805fdcf09b283bfdc4aff18fb9bfca4f40b31a2c6169a3e13a3f",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge quick movement up to five with flying path legality"
        ]
      },
      {
        "family": "reaction-trigger-and-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Grant linked Relocation reaction"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_defensive_pulse_support",
    "sourceFingerprint": "e27481c3395063141410a7bb0b854154a39ce3805c6e68c68d64ae38670fe5cf",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "full-action-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge full action"
        ]
      },
      {
        "family": "allied-status-clear",
        "owningChunk": 5,
        "acceptance": [
          "Clear Jammed and Lock On only for allies within3"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_demolition_hammer_demolisher",
    "sourceFingerprint": "80ed7419d83a9ef5e079194e05dfbb8a262f39815400322a28c5a82c978439ad",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "superheavy-melee",
        "owningChunk": 4,
        "acceptance": [
          "Validate full-action AP attack and tier statistics"
        ]
      },
      {
        "family": "hit-save-stun",
        "owningChunk": 5,
        "acceptance": [
          "Capture target Hull save before Stunned until next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_deployable_turret_engineer",
    "sourceFingerprint": "810adf05be528d66a91b735542004bd40e4af7aaa426e36e3650a626f11665c9",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Quick free-adjacent deployment and six-turret cap"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Tier turret stats; owner-turn attack timing and destruction disables turrets"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Nearest hostile range10 turret native attack by tier"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_det_spike_seeder",
    "sourceFingerprint": "02b0b2234c71522e353dd8b4e82a3825f4e5158d7ed013623698f847dcf0e261",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "full-recharge-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge full action and recharge5"
        ]
      },
      {
        "family": "multi-target-save",
        "owningChunk": 5,
        "acceptance": [
          "Select at most3 visible targets within5 and attach only after failed Systems saves"
        ]
      },
      {
        "family": "delayed-overlap-bursts",
        "owningChunk": 4,
        "acceptance": [
          "At Seeder next turn resolve each attached Burst1 separately including overlap damage"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_devastator_ultra",
    "sourceFingerprint": "54602ba9cd4a7b9b93b259b0af7c7e80aaa7e00faed311dd7f08e62c3b66b4f3",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "successful-attack-trigger",
        "owningChunk": 6,
        "acceptance": [
          "Once per round after confirmed successful attack affect every LOS character"
        ]
      },
      {
        "family": "damage-choice",
        "owningChunk": 5,
        "acceptance": [
          "Capture kinetic explosive or energy selection and apply native tier damage"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Enforce per-round use maximum and refresh exactly once: 1"
        ]
      }
    ],
    "unresolved": [
      "Damage-type chooser is not identified explicitly in this feature."
    ]
  },
  {
    "lid": "npcf_devils_cough_shotgun_assassin",
    "sourceFingerprint": "75321559857a7936d694af7aeccc6a421af94bda1c9b7d020bf2263b3fa04c28",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Loading readiness"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Heavy CQB range/threat and tier damage"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Knockback2 legal displacement"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_dig_in_demolisher",
    "sourceFingerprint": "0aecb26f02cd773d816b94919b4cea748aea890a05a030b5ace4eb83c88ed0c5",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "pre-damage-reaction",
        "owningChunk": 7,
        "acceptance": [
          "Offer after hit before damage once per round"
        ]
      },
      {
        "family": "reaction-effects",
        "owningChunk": 5,
        "acceptance": [
          "Apply resistance to that attack and Slowed through next turn"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_disciplined_squad",
    "sourceFingerprint": "7f2302531c1090707655a4f35664fe169996f94e0c73e7b334c9dc18087237bb",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "attack-count-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Preserve Squad attack count when HP falls"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_dispersal_shield_priest",
    "sourceFingerprint": "a0b14939abd364678b83df789e35fc74d000211a93cb6799d80998d2b77822e7",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge quick self/allied Sensors target"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Native random hit count and resistance to damage/heat"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Consume only on hit; prohibit stacking"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_disruptor_whip_horror",
    "sourceFingerprint": "4e60c4fe9337bc047cf437f4f4714515014264ff7a3f97ce88772e5d2e627f65",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "zero-damage-melee",
        "owningChunk": 4,
        "acceptance": [
          "Validate Threat3 and native zero-damage attack without suppressing on-hit"
        ]
      },
      {
        "family": "overshield-removal",
        "owningChunk": 5,
        "acceptance": [
          "Remove all Overshield only after confirmed hit"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_drag_down_barricade",
    "sourceFingerprint": "3a8b01c59a72ac6a85ad5d3996624e18f829415457a89058bc26f44afa34d359",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tech-movement-damage",
        "owningChunk": 5,
        "acceptance": [
          "On Sensors tech success attach AP Energy damage per voluntary moved space through target next-turn end"
        ]
      },
      {
        "family": "movement-event-timing",
        "owningChunk": 6,
        "acceptance": [
          "Distinguish forced from voluntary movement and expire once"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve quick-tech action cost"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_drain_systems_specter",
    "sourceFingerprint": "1ee1b473b74f9ed64e35325194625c1182786dab919dc71470db44bc26f21ec9",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Full-tech adjacent targeting"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Native tech success applies Stunned"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Other-character adjacency entry/start removes Stunned"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_driving_swarm_hive",
    "sourceFingerprint": "505d458b6901ed0112906a9659ae9722b287883a2fe5b5955acbf10a49e49203",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "burn-linked-forced-move",
        "owningChunk": 5,
        "acceptance": [
          "After razor-swarm Burn capture Systems save and Hive direction for4-space failed-save movement ignoring engagement and reactions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_drone_barrage_hive",
    "sourceFingerprint": "302918c490422436b9581b0e215f53096e57aaad62898f8efc49de75aea46fd7",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tech-branch-choice",
        "owningChunk": 5,
        "acceptance": [
          "On Sensors tech hit capture target choice of conditions or movement, and source direction"
        ]
      },
      {
        "family": "forced-movement-exceptions",
        "owningChunk": 2,
        "acceptance": [
          "Validate up-to-five-space route ignoring engagement and reaction provocation"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve quick-tech action cost"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_drum_shotgun_goliath",
    "sourceFingerprint": "f1ca55633c59b7a4597c031021eeb248b41f97553b1bc0b4f6abc8ebe5993816",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "One/two/three tier attacks and repeated/split targets"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Each attack continues only from confirmed previous resolution"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_dual_shotguns_breacher",
    "sourceFingerprint": "98a4c37d1c4549db74716d55c953d7f684fb77312ab171e54c8ca61f6f859308",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "two-attack-sequence",
        "owningChunk": 4,
        "acceptance": [
          "Offer two independently resolved attacks against same or distinct legal Range3 Threat3 targets"
        ]
      },
      {
        "family": "attack-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Do not launch second attack after cancelled or uncertain first result"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_duck_and_cover_squad",
    "sourceFingerprint": "80aaf26342023a7b113ac7cdcbdf6e7c1802d64027d276693998faa030cf00f9",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "hit-reaction",
        "owningChunk": 7,
        "acceptance": [
          "Offer only after actual hit"
        ]
      },
      {
        "family": "resistance-condition",
        "owningChunk": 5,
        "acceptance": [
          "Apply attack-specific resistance and Immobilized until target next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_earthshaker_shells_bombard",
    "sourceFingerprint": "4fa41f7200983292156760018c94084d9101a096a73a4b372aba93bbb62d6515",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge free attack-linked activation"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Burst3 from Bombard target and two free cover positions"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Hull save gates Prone"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Create two Size1 hard-cover segments"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_echo_edge_ronin",
    "sourceFingerprint": "66972728377dfe1237da8aac2605e1cdd662b04a405c05fe4bec87c666cb025f",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "damage-mark-ledger",
        "owningChunk": 6,
        "acceptance": [
          "Mark each Ronin-damaged character and retain marks until cleared"
        ]
      },
      {
        "family": "turn-start-mark-damage",
        "owningChunk": 5,
        "acceptance": [
          "At turn start optional free clear deals native1d6 AP Kinetic to cleared marked characters"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_efficient_killer_mercenary",
    "sourceFingerprint": "f60c461caa0d58f89584c6f3a7e54573020eb710f98dd5cd3184406f44fea181",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "target-structure-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Apply Accuracy and AP only against targets with at most two Structure"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_electrified_bola_cataphract",
    "sourceFingerprint": "b4c4e82020ef2a86d918d6285fc2a66d71342eda1d1b9621a57f0be3d6bca895",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge quick flying target within ten"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Agility save gates damage-free fall and Immobilized"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Immobilized ends at target next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_electrified_lasso_cataphract",
    "sourceFingerprint": "8312ef5b9d0c29eb66d9b36a615a10cf3cfeb263687fbcd587fa8e5e3bc66a1d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "quick-round-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action once per round"
        ]
      },
      {
        "family": "save-pull-grapple",
        "owningChunk": 5,
        "acceptance": [
          "Require visible target within5 failed Hull save then nearest legal pull and automatic Grapple only if adjacent"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_electro_nanite_cloud_hive",
    "sourceFingerprint": "c075691971ed11a7be0b08fb136a48453f28918737ee4d05374ae9f0f18dbe0a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "hostile-aura-timing",
        "owningChunk": 6,
        "acceptance": [
          "Apply Burn at hostile turn start within range 3 and tier Systems/tech difficulty until target exits"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_emergency_vent_scourer",
    "sourceFingerprint": "2b2320a94bb16c2cf9da4c7dbb98062fa58d9da35b51fdab0690630dd57e3b1e",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Heat-cap exceedance or Stunned grants invisibility until next-turn start"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_empowered_cloud_support",
    "sourceFingerprint": "68707e48a3a0dd54d4a86a0de88cac7eaf97d2e9ec7969826beb3c8a2a07a026",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "optional-turn-cleanse",
        "owningChunk": 5,
        "acceptance": [
          "At ally turn start require adjacency and explicit choice of one condition to remove"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_empowered_shield_priest",
    "sourceFingerprint": "cad4dcbe0e60a5d03c8f2a14c2ef193c994a3dcbde0b6bbc038a1149593b44b6",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "linked-shield-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Add tier Overshield only to Dispersal Shield recipients with native cap and replacement handling"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_endless_rain_rainmaker",
    "sourceFingerprint": "a26c154f8bddb64e18d1381c83b1078d313167f0004c5ecc757632fad445d1f7",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Javelin placement count increases from three to six"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_engineers_mark_engineer",
    "sourceFingerprint": "0b680809cd056f1f561446f40c7f43119dd1aa42a530bfea43242035fe183a4f",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "quick-recharge-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action and recharge6"
        ]
      },
      {
        "family": "turret-target-override",
        "owningChunk": 6,
        "acceptance": [
          "Permit chosen in-range turret target instead of nearest hostile through Engineer next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_evasive_ultra",
    "sourceFingerprint": "954e2e8c5c42d7aaaf0347c147fcdb45da9543779207ac2406436108cb848894",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "capped-template-stat",
        "owningChunk": 6,
        "acceptance": [
          "Verify Evasion bonus capped at 20 and Structure reduction without double application"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_exotic_systems_exotic",
    "sourceFingerprint": "bc02cfa0e251681821c800f75de20de0858bfb87d23decc69e6203a500792c68",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Limit selected Exotic systems/traits to two"
        ]
      }
    ],
    "unresolved": [
      "Referenced Exotic options list requires linked review"
    ]
  },
  {
    "lid": "npcf_explosive_jet_pyro",
    "sourceFingerprint": "988ec3910259408876c5875b689ff3d5ec6cb62003dc8fe233276e5ca03e29df",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "quick-recharge-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action and recharge5"
        ]
      },
      {
        "family": "burst-targets",
        "owningChunk": 4,
        "acceptance": [
          "Limit save targets to enemies in Burst2"
        ]
      },
      {
        "family": "push-prone-flight-sequence",
        "owningChunk": 5,
        "acceptance": [
          "Resolve Hull saves before outside-area push Prone then Pyro flight5 and landing"
        ]
      },
      {
        "family": "conditional-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Resume flight only after observed prior resolution"
        ]
      }
    ],
    "unresolved": [
      "Outside-area displacement distance and choice need authoritative path policy."
    ]
  },
  {
    "lid": "npcf_explosive_knives_assassin",
    "sourceFingerprint": "223e05581f954f86d009fdfd4d082252b095dbeb238d1e0619d644563822a04a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "limited-ranged-attack",
        "owningChunk": 4,
        "acceptance": [
          "Validate range 3 attack using stated tier bonus"
        ]
      },
      {
        "family": "delayed-target-explosion",
        "owningChunk": 6,
        "acceptance": [
          "Anchor detonation to hit target next-turn end and Burst 1"
        ]
      },
      {
        "family": "delayed-damage",
        "owningChunk": 5,
        "acceptance": [
          "Use native tier explosive damage after confirmed hit"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Track Limited charges and spend only once on confirmed use: 3",
          "Reserve one quick action"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_explosive_vent_pyro",
    "sourceFingerprint": "0482722697db36ef45ddd60e009ccfec3e7cc9c7d9c134378be3bf9eccc38bf2",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Full-action activation"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Burst1 affected characters"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Clear own heat; save gates half-cleared heat and Prone"
        ]
      }
    ],
    "unresolved": [
      "Half-heat rounding requires authoritative general-rule review"
    ]
  },
  {
    "lid": "npcf_expose_weakness_scout",
    "sourceFingerprint": "b6d6a9fdfb92c909b22bed111d4f88a36e07b3cf173b016dd719e20b37bf014c",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "next-hit-bonus",
        "owningChunk": 6,
        "acceptance": [
          "Attach tier bonus after Marker Rifle hit consume on next successful ranged or melee hit and expire at scene end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_extended_blade_ronin",
    "sourceFingerprint": "0cfdaf63d68a35f08a09da7121ea04c7312651ed7c1d96b1ae92524fb4d56f8b",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-threat-critical-trigger",
        "owningChunk": 6,
        "acceptance": [
          "Extend sword Threat to 3 and first critical per turn damages all Threat characters including target"
        ]
      },
      {
        "family": "automatic-area-damage",
        "owningChunk": 5,
        "acceptance": [
          "Read actual tier kinetic damage outcome"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_extra_deadly_ultra",
    "sourceFingerprint": "4c1f2a67b4e318168ee39406bbc2374776c606709432dd92b22263c1e971a10a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "First critical per turn gains T2/T3 bonus native damage"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_extrudite_barricade",
    "sourceFingerprint": "802fc955178d8d4dd39f6c9935633e46cf828487a3f89247b73df0a0ae792173",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "printer-count-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Expand linked Mobile Printer to two distinct cubes per use with separate legal placements"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_eye_of_midnight_sentinel",
    "sourceFingerprint": "71ea0edccdc440478ae88847b689b4d67124508d3459f8dcf8e007489b7909ac",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "overwatch-frequency",
        "owningChunk": 7,
        "acceptance": [
          "Allow Overwatch once per turn while armed"
        ]
      },
      {
        "family": "persistent-slow",
        "owningChunk": 6,
        "acceptance": [
          "Apply Slowed until quick-action deactivation"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve one quick action"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_fade_generator_operator",
    "sourceFingerprint": "cd8a530f86882a8aaccd29d00382097891755a9bee5e8cc3a27c6525d2fb7368",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Turn-end invisibility expires next start or immediately on damage/reaction"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_favors_owed_mercenary",
    "sourceFingerprint": "4c9384b0656a45f558d6a71117a2c2a03fb6ec220a6dc3384fb6f017af89b099",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "limited-quick-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve one Limited use and quick action"
        ]
      },
      {
        "family": "blast-origin",
        "owningChunk": 4,
        "acceptance": [
          "Validate Blast2 within30 and LOS"
        ]
      },
      {
        "family": "save-damage-prone",
        "owningChunk": 5,
        "acceptance": [
          "Capture Agility saves with tier damage half on success and Prone only on failure"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_fearless_defender_bastion",
    "sourceFingerprint": "0e43da0d0f5c3ed63ffc2c40ec54cc463cce503e8404d5ed3161480313b1cb7a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "damage-interception",
        "owningChunk": 7,
        "acceptance": [
          "Require ally damage within range 5 and reject source movement-disabling states"
        ]
      },
      {
        "family": "intercept-move",
        "owningChunk": 2,
        "acceptance": [
          "Validate adjacent destination before moving source"
        ]
      },
      {
        "family": "damage-redirection",
        "owningChunk": 5,
        "acceptance": [
          "Redirect only triggering damage once per round"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Enforce per-round use maximum and refresh exactly once: 1"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_feign_death_veteran",
    "sourceFingerprint": "ee30286ec2ba75f5fe3c8f02f06aedda127acd36f57b0e68a65a4eb8b9446cd3",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "First destruction per combat becomes concealed one-HP survival; action/move reveal"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Adjacent Systems/pilot check confirms discovery"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_firebreak_shield_pyro",
    "sourceFingerprint": "cd943aadf52046d2253b856382f1eeaafe4a535c0a3d618fe283ea657f8affac",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "shield-line-placement",
        "owningChunk": 4,
        "acceptance": [
          "Validate Line4 height4 free cells visible and touching Pyro adjacency"
        ]
      },
      {
        "family": "shield-cover-miss",
        "owningChunk": 6,
        "acceptance": [
          "Provide soft cover and native miss-on4plus check without Invisible stacking and remove on movement Stunned or next turn"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_flak_cannon_engineer",
    "sourceFingerprint": "76a0433e27d262d9016d452fe0c8199b6849f1dff3a7cf3d92e6e593a77963cf",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "smart-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Use E-Defense and tier cannon statistics with flying-target Accuracy bonus"
        ]
      },
      {
        "family": "target-flight-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Apply plus-two Accuracy only to flying targets"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_flamethrower_pyro",
    "sourceFingerprint": "7a037adc23e3afda983b36521767d6720f6a6ab257c7afabdae0e314995f686a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Self-heat4 reservation"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Cone5 tier Burn native attack"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Double Burn only against already-burning targets"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_flare_drone_bombard",
    "sourceFingerprint": "501edd41dd46e6d3af26ba7c59e9ad8b4a5a5effc3662c8672e7e9409c417c88",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "quick-drone-placement",
        "owningChunk": 2,
        "acceptance": [
          "Deploy within25 LOS and replace existing drone"
        ]
      },
      {
        "family": "drone-aura",
        "owningChunk": 4,
        "acceptance": [
          "Verify Burst2 containment"
        ]
      },
      {
        "family": "reveal-and-target-bonus",
        "owningChunk": 6,
        "acceptance": [
          "Prevent Invisible Hide in area and add Bombard attack accuracy while preserving friendly fire"
        ]
      },
      {
        "family": "drone-stat-block",
        "owningChunk": 6,
        "acceptance": [
          "Create Size half drone HP10 20 30 by tier with Evasion10 EDefense10 and enforce one active drone."
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_flash_lens_scourer",
    "sourceFingerprint": "3c00cedb225290b2f536c5393c3258037ab0362c1ccce2763c1bb98303a6013d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "cone-save-area",
        "owningChunk": 4,
        "acceptance": [
          "Validate all characters in source Cone 5"
        ]
      },
      {
        "family": "systems-save-condition",
        "owningChunk": 5,
        "acceptance": [
          "Capture Systems saves before Jammed until source next-turn start"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 6",
          "Reserve one quick action"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_flechette_shot_breacher",
    "sourceFingerprint": "3a97ec573a6e4a2dc3cb529664da516b909becf4286935db9fc480012bb614e6",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Range/threat3 targeting; fixed-direction Cone3 starts at targeted-space edge and includes that space"
        ]
      }
    ],
    "unresolved": [
      "Exact edge/orientation selection needs general geometry interpretation"
    ]
  },
  {
    "lid": "npcf_flier_ship",
    "sourceFingerprint": "90f57be7d4a4cca59ad83409c1e5af728b99028fa535de127d00bfd93a943ff1",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "environmental-flight",
        "owningChunk": 2,
        "acceptance": [
          "Support zero-g motion and atmospheric hover"
        ]
      },
      {
        "family": "ship-condition-immunity",
        "owningChunk": 6,
        "acceptance": [
          "Reject Immobilized Stunned Prone"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_flier_vehicle",
    "sourceFingerprint": "185cc216a1fa3a6fb79be9816a456b81d6db17659f5fda63ba9185bf1d501239",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "flight-movement",
        "owningChunk": 2,
        "acceptance": [
          "Validate flight for normal movement and Boost including destination footprints"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_focus_down_scourer",
    "sourceFingerprint": "069e83a0541516e9d6c2a5ebc4da7c8f352d7799a0fefac5df193c1b4e77073e",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Prior-round Thermal Lance hit history gates tier Burn on current hit"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_follower_count_breacher",
    "sourceFingerprint": "7f5ca0c9c9e7d761f6b6863653da2089201e1476e1eb1a826f11dad1581b2a03",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tech-target-link",
        "owningChunk": 5,
        "acceptance": [
          "Use Sensors tech success to bind permanent target until either destroyed"
        ]
      },
      {
        "family": "linked-attack-accuracy",
        "owningChunk": 6,
        "acceptance": [
          "Apply tier accuracy only against bound target"
        ]
      },
      {
        "family": "free-directional-boost",
        "owningChunk": 2,
        "acceptance": [
          "Allow one free Boost per turn only directly toward bound target"
        ]
      },
      {
        "family": "quick-tech-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve quick tech and native tier attack values without inheriting weapon tier defaults."
        ]
      },
      {
        "family": "tier-tech-native-flow",
        "owningChunk": 5,
        "acceptance": [
          "Assert native tier attack bonuses1 2 3 accuracy1 and tier overrides."
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_fortress_operator",
    "sourceFingerprint": "b7a3771c44fc27fe5b0e19ee1724131257026c494e31fc13ef59febcbc7717d2",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "defensive-tech-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Apply Systems save Accuracy and incoming tech Difficulty as separate bonuses"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_fortress_priest",
    "sourceFingerprint": "3ca33f50126faf394e3f70cc30fe00b6689b57f225499e0b20e56e8b6bffc1ad",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Replace Hardened Target modifiers with three rather than stacking"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_fortress_specter",
    "sourceFingerprint": "0e2f0b1df109bd1dc63f8535119a06d69a3a97ac54d27f356ba16b59635923df",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tech-defense-modifiers",
        "owningChunk": 6,
        "acceptance": [
          "Apply Systems-save accuracy3 and incoming tech difficulty3"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_fortress_ultra",
    "sourceFingerprint": "3bb312735025945e7a431fc35eaac98b84f8c2542d502ab1b2dd840cc3bf366e",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "defensive-tech-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Apply Systems save Accuracy and incoming tech Difficulty as separate bonuses"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_fractal_assault_priest",
    "sourceFingerprint": "dbb43046eb3ff75c256009c2e82d75f7cea09f0acf1a3e50928e6f0f337855fd",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "reaction-trigger-and-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Investiture-linked damage trigger; round limit and recharge"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Attacker Systems save gates Stunned"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Stunned expires at attacker next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_friendly_interdiction_bastion",
    "sourceFingerprint": "6431805fb7bd1638c7ffb6a4e7341f57a42293d809611011101046c48fddf506",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "protocol-target-choice",
        "owningChunk": 2,
        "acceptance": [
          "Select visible enemy and adjacent ally with protocol retargeting"
        ]
      },
      {
        "family": "source-specific-resistance",
        "owningChunk": 6,
        "acceptance": [
          "Apply resistance to Bastion and chosen ally only against selected source and remove ally effect on broken adjacency"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_full_spectrum_sensor_suite_spec_op",
    "sourceFingerprint": "4723956d7dec820034d8c4722d61425617e132a6785f0753da7ae08a44e4526c",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "protocol-lock-on",
        "owningChunk": 2,
        "acceptance": [
          "Offer Lock On using protocol budget"
        ]
      },
      {
        "family": "allied-cover-exception",
        "owningChunk": 6,
        "acceptance": [
          "Ignore cover only when allied Spec Ops within range 10 consumes Lock On and enforce one carrier per combat"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_fusion_cutter_industrial_mech",
    "sourceFingerprint": "111c81f54103a7a067f47be832180ef0e68048d626fb144fc75d892a88c6c0bc",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Threat1 tier melee native multi-type energy Burn heat damage"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_glitch_scanners_mirage",
    "sourceFingerprint": "8d4c716178a6bdc7fd178bb01addd4506f5a15f03aaa1e853693e27f47af9258",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "quick-action-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action"
        ]
      },
      {
        "family": "allied-teleport",
        "owningChunk": 5,
        "acceptance": [
          "Select at most2 allies in Sensors and legal5-space destinations without engagement reactions"
        ]
      },
      {
        "family": "linked-reaction",
        "owningChunk": 7,
        "acceptance": [
          "Resolve separate Blip descriptor before offering its reaction"
        ]
      }
    ],
    "unresolved": [
      "Reaction tag does not supply Blip trigger in this record."
    ]
  },
  {
    "lid": "npcf_got_your_back_archer",
    "sourceFingerprint": "e9a79798e10b629e412e92de63fd1a6b5878b80174c9f6c91a29894f8e81a44f",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "zone-attack-trigger",
        "owningChunk": 7,
        "acceptance": [
          "Require attack by character inside active covering zone and native trigger timing"
        ]
      },
      {
        "family": "reaction-attack",
        "owningChunk": 4,
        "acceptance": [
          "Validate selected native weapon target before reaction attack"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_grasping_claws_monstrosity",
    "sourceFingerprint": "47a469bf29869b7b7ac1a9fffc92ebdb3717692385fc15782be9327d80642b93",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Grapple accuracy and owned-grapple target attack accuracy"
        ]
      },
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Allow Boost while grappling"
        ]
      },
      {
        "family": "reaction-trigger-and-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Permit reactions while grappling"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_grav_grenade_launcher_seeder",
    "sourceFingerprint": "359adfed72310b355a8f43e2651b17b2821cdf978aea114f265b3dfe4aa843d3",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "arcing-blast-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Validate Range8 Blast1 Arcing geometry and tier native damage"
        ]
      },
      {
        "family": "knockback",
        "owningChunk": 5,
        "acceptance": [
          "Resolve Knockback1 on confirmed attack result"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_grav_spike_seeder",
    "sourceFingerprint": "c31accdc9cf1e802f7939cf1f9b61095de1015d44e7c8168602fa70e2e7ca860",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "save-attach-forced-movement",
        "owningChunk": 5,
        "acceptance": [
          "Validate range 5 and LOS Systems save, protocol detonation tier AP damage and chosen three-space pull"
        ]
      },
      {
        "family": "attached-resource-lifecycle",
        "owningChunk": 6,
        "acceptance": [
          "Track every spike and removal by quick action plus successful Systems save"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve one quick action"
        ]
      }
    ],
    "unresolved": [
      "Pull in a chosen direction differs from normal pull geometry; exact exception needs confirmation."
    ]
  },
  {
    "lid": "npcf_graviton_lance_barricade",
    "sourceFingerprint": "b381b69254940a35a1cace37637b5afd3de0a4abe518020015c17a45f6042daa",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Range10 attack; T2/T3 two attacks repeated or split"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Confirmed hit applies Slowed"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Slowed expires target next-turn end"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Dependent attack cancellation and receipt handling"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_gravity_rifle_spacer",
    "sourceFingerprint": "351014104464408810b0add03d629417fdb3167a9a9accccddf75fcf6347279f",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "single-ranged-attack",
        "owningChunk": 4,
        "acceptance": [
          "Validate Range10 native attack"
        ]
      },
      {
        "family": "save-pull-collision",
        "owningChunk": 5,
        "acceptance": [
          "Capture Hull save then straight pull toward Spacer up to10 stop at obstruction and Prone only on collision"
        ]
      }
    ],
    "unresolved": [
      "Source lacks damage profile; do not invent one."
    ]
  },
  {
    "lid": "npcf_greater_investiture_priest",
    "sourceFingerprint": "b3d4649c7d4cd94202bc3d08307c2539aa393ca750da8ed814d2770d2cfd56ce",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "linked-resistance",
        "owningChunk": 6,
        "acceptance": [
          "Add all-damage resistance to Investiture target and Immobilized to linked Priest until link ends"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_grind_maniple_hive",
    "sourceFingerprint": "e14473e9f0ddd6144668273e4fcfed6c8177d0ae23a44a0955ea14bea40e3b33",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Quick-tech hostile Sensors and LOS policy"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Native tech success applies per-action Burn"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Action/reaction events deal Burn until target next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_guardian_aegis",
    "sourceFingerprint": "1e3100a6b5d59b7f2dfaf1b2d3682d39c0413212e0221401f0cb655ea7281b94",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "ally-hard-cover",
        "owningChunk": 6,
        "acceptance": [
          "Use Aegis occupied footprint as hard cover for allied targets"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_guardian_bastion",
    "sourceFingerprint": "370e5ca1f03bfc4dc59b704ccd84f66413f5f0a715d093f809709f0704c6ac29",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "allied-cover",
        "owningChunk": 6,
        "acceptance": [
          "Expose Bastion hard cover only to allied beneficiaries and verify geometry"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_guardian_goliath",
    "sourceFingerprint": "690d1863fd038744e1999d7a0759b85a01c2167551ba40e38a2d8646092597e6",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Allied cover calculations treat Goliath as hard cover"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_guardian_sentinel",
    "sourceFingerprint": "09162d20938ada37b76d69f0e99da654318c9a4a1708a109ccbbd87b0ec77ddd",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "ally-hard-cover",
        "owningChunk": 6,
        "acceptance": [
          "Use Sentinel occupied footprint as hard cover for allied targets"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_gyrojet_cannon_spec_op",
    "sourceFingerprint": "75252ae90a11bfa047dff984c3e162fa8dc30b042ecaf5eb5b97a769827cec75",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "loading-knockback-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Validate tier Launcher attack and Loading state"
        ]
      },
      {
        "family": "knockback",
        "owningChunk": 5,
        "acceptance": [
          "Resolve two-space Knockback after confirmed hit"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_ha_blackwall_system_aegis",
    "sourceFingerprint": "deb94e2fa0475d9a170857fa97ab1e4f2c4c379feefdfd7151db8eb1498afc1c",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Limited full-action free-space wall placement; quick termination"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Line10 wall within five; height five and blocking geometry"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Native roll gates removal and explicit free-space return choice"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Entry/start triggers; delayed return; destroyed-owner wall cleanup"
        ]
      }
    ],
    "unresolved": [
      "Return-position rule on early wall termination is underspecified"
    ]
  },
  {
    "lid": "npcf_hacker_veteran",
    "sourceFingerprint": "a2c0e07fb2e85b250507891d87a687c285e4407124bde8e1f02d6cea889ddebb",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tech-hit-heat-bonus",
        "owningChunk": 6,
        "acceptance": [
          "Add2 heat only to successful tech attacks"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_hades_missiles_rainmaker",
    "sourceFingerprint": "9ee0984ee3335900e2668dbf03fba7d395e428c6534b7d845bf7dd86fd4bf2e1",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "remote-cone",
        "owningChunk": 4,
        "acceptance": [
          "Validate Cone 3 starting within range 20 and route instead of LOS"
        ]
      },
      {
        "family": "save-damage-heat",
        "owningChunk": 5,
        "acceptance": [
          "Capture Agility save for tier Energy damage plus heat with halving semantics"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 5",
          "Reserve one quick action"
        ]
      }
    ],
    "unresolved": [
      "Save halving language does not separately state heat rounding or halving."
    ]
  },
  {
    "lid": "npcf_hail_of_fire_archer",
    "sourceFingerprint": "dee5648920f53fbf267fc8ea852a289b4c1053b7aa63404ca862352a00f44a3e",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge quick enemy range10 targeting"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Apply Immobilized and Impaired; target choice controls release attack"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Expiry on target next end or Archer Stunned/Jammed"
        ]
      },
      {
        "family": "reaction-trigger-and-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Target-permitted single weapon reaction releases control"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_hardened_target_exotic",
    "sourceFingerprint": "d55b64633604ae54d89188d89451de5215e601b70385fb7d473e8000b2eec663",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tech-defense-modifiers",
        "owningChunk": 6,
        "acceptance": [
          "Apply Systems-save accuracy1 and incoming tech difficulty1"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_hardened_target_priest",
    "sourceFingerprint": "db4e57a97805f2d1723f63341d5bde06391eb2354caa14f7acf1c797a51a4e55",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "defensive-tech-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Apply Systems save Accuracy and incoming tech Difficulty separately"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_hardened_target_veteran",
    "sourceFingerprint": "26f35dcce01f659b4f6a0713456eae314cb04c7637bd757a5424f0ddba6e4389",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Systems-save accuracy and incoming-tech difficulty apply once"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_hardlight_cover_system_aegis",
    "sourceFingerprint": "e6c9a7f4c06c0924b0361775625e404b9bd5fba23d9bda8797f1b392986291e2",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "quick-recharge-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action and recharge5"
        ]
      },
      {
        "family": "hardlight-wall",
        "owningChunk": 4,
        "acceptance": [
          "Verify Line3 placement and hard-cover geometry"
        ]
      },
      {
        "family": "wall-protection",
        "owningChunk": 6,
        "acceptance": [
          "Make wall immune and grant protected targets resistance against all listed area shapes"
        ]
      }
    ],
    "unresolved": [
      "Deployment range origin duration and height absent from this record."
    ]
  },
  {
    "lid": "npcf_harpoon_cannon_berserker",
    "sourceFingerprint": "e34a11111e3e47d1016eb49324697e0f743d524de7bdb9d8a52233fd8b2a3420",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "native-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Validate ranged and Threat modes with tier attack statistics"
        ]
      },
      {
        "family": "size-dependent-pull-grapple",
        "owningChunk": 5,
        "acceptance": [
          "Pull smaller or equal target directly adjacent or move source toward larger target, then Grapple only if adjacent"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_headshot_veteran",
    "sourceFingerprint": "34246f2328eca98fb8e2a818d58c81177e3320c5621cb5c19777db6d2c5b83ff",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Once-round availability"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Critical-triggered Hull save gates adjacent-only LOS"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Restriction expires at target next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_heated_blade_assassin",
    "sourceFingerprint": "a1e7e542ebe08054818a87d24efa6ea06363cf0bdedb9583eb5bca82cce9ecfa",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "melee-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Validate Threat2 tier native damage"
        ]
      },
      {
        "family": "condition-double-damage",
        "owningChunk": 6,
        "acceptance": [
          "Double damage once when target has any listed vulnerable condition"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_heavy_assault_rifle_assault",
    "sourceFingerprint": "bc0e025e9194a70d7a59a14fcb874646f67803caaf01650a8e321206551350dd",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "reliable-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Validate tier Rifle attack and tier Reliable damage using native hit or miss result"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_heavy_assault_shield_bastion",
    "sourceFingerprint": "e765b8b46cd7a690f65f6243ec933686bf245e99e82c23b594d6c96f5bc5b4cf",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Threat1 Heavy melee tier attack"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Knockback1 legal displacement"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_heavy_frame_demolisher",
    "sourceFingerprint": "c17e2b70b8c04470be0a553d20bad31b3268032285ae5e74c84fa64e1a808f0a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "size-based-movement-immunity",
        "owningChunk": 6,
        "acceptance": [
          "Reject push pull knockback and Prone when source character is smaller"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_heavy_frame_goliath",
    "sourceFingerprint": "7a072c32bbf1450b26ed1d496a1c92ab6ae78c0bbc2008dcbadd797c6a70c150",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "size-based-immunity",
        "owningChunk": 6,
        "acceptance": [
          "Reject push pull Prone and Knockback from smaller characters"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_hellfire_projector_ultra",
    "sourceFingerprint": "d4c3a1fa2fb10cee57200818e2f39b79bbcc830cb9aa9a9b146c24b67e688c2c",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Two Cone5 attacks must have disjoint areas; tier energy and Burn"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Two-attack native-result continuation"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_hex_missiles_hornet",
    "sourceFingerprint": "917d8c4b3b6f46219b40bd351aaa194eb7f8bc8d5354bccf31db0345850aa949",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "smart-blast-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Use EDefense for Range10 Blast1 tier Heat weapon"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_high_impact_rounds_assault",
    "sourceFingerprint": "01a9c517ea0696b42f146bdad3f8699089532a131b22a1a5e1121cb35f6da785",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-ammunition-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Restrict special rounds to Heavy Assault Rifle and add AP plus four damage"
        ]
      },
      {
        "family": "reload-state",
        "owningChunk": 2,
        "acceptance": [
          "Require reload after confirmed special-round attack before rifle reuse"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_high_impact_shells_bombard",
    "sourceFingerprint": "7befe602cbdef9e77f25008a01e8e2138648570c3a7fc10cbcfc319e5e605ec7",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Bombard hit pushes target three away from Bombard not blast center"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_hopping_mines_seeder",
    "sourceFingerprint": "83ce5b51b650580a57ac0ef84ae946a327f959fd2e352879f63e7cba71b0f3be",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "linked-mine-elevation-trigger",
        "owningChunk": 6,
        "acceptance": [
          "Extend Lay Mines triggers to hostile movement up to10 above and jump toward first collision"
        ]
      },
      {
        "family": "vertical-legality",
        "owningChunk": 2,
        "acceptance": [
          "Use authoritative elevation and collision data for mine trajectory"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_hound_missiles_rainmaker",
    "sourceFingerprint": "bcc25465496307629a356a67359a2cf107dd092ad7b75bd657a7ad8bb580702c",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "homing-drone-lifecycle",
        "owningChunk": 6,
        "acceptance": [
          "Deploy adjacent drone with tier HP and select visible range-20 target, move on source turn with Lock On bonus"
        ]
      },
      {
        "family": "collision-burst",
        "owningChunk": 4,
        "acceptance": [
          "Resolve Burst 1 on first collision"
        ]
      },
      {
        "family": "saved-damage",
        "owningChunk": 5,
        "acceptance": [
          "Capture Agility save for tier Energy damage or half"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 6",
          "Reserve one quick action"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_hover_propulsion_ultra",
    "sourceFingerprint": "9a9841fa9483cb9c9557d001b8dc6cfee99d72a383b935a9fb47e776ea7bfbc6",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Hover movement and Boost legality including elevation"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Passive hover availability"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_hunger_pursuit_limpets_barricade",
    "sourceFingerprint": "ff78bf342ecd76b62c81e74b003c45f585606d7ed4ec07efcd4c2c81ab5d786f",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "quick-recharge-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action and recharge6"
        ]
      },
      {
        "family": "minefield-placement",
        "owningChunk": 4,
        "acceptance": [
          "Place free adjacent Size4 area"
        ]
      },
      {
        "family": "zone-terrain-timing",
        "owningChunk": 6,
        "acceptance": [
          "Apply difficult terrain and count first entry per round or turn start"
        ]
      },
      {
        "family": "entry-save-status",
        "owningChunk": 5,
        "acceptance": [
          "Capture Systems save then Slowed until target next-turn end"
        ]
      }
    ],
    "unresolved": [
      "Size4 area shape is not fully specified."
    ]
  },
  {
    "lid": "npcf_hunker_down_assault",
    "sourceFingerprint": "cd5028951220b81d3d6350ff48d08a800357148dfcc0225d5099454d5723fead",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "pre-damage-hit-reaction",
        "owningChunk": 7,
        "acceptance": [
          "Offer after hit before damage roll once per round"
        ]
      },
      {
        "family": "attack-resistance",
        "owningChunk": 5,
        "acceptance": [
          "Apply resistance only to triggering attack"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Enforce per-round use maximum and refresh exactly once: 1"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_hunt_specter",
    "sourceFingerprint": "f933853db64736dcb328cb484b1ea36a403cf05f251450562e983f0934d5a4ce",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Melee bonus requires no other character adjacent to target"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_hunter_killer_nexus_hive",
    "sourceFingerprint": "c706f936f3efb176113cd1c1fe806a8e5507225f82345ce703d3cf680134661d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tier-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Use one two three attacks by tier with same or split Range8 targets and Smart Seeking"
        ]
      },
      {
        "family": "attack-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Require confirmed native result before each dependent attack"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_huntsman_rainmaker",
    "sourceFingerprint": "385d0fb6766935414a1c50edb221c4fbb62236e6d2e5553ae835ddb6be0cdc82",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "lock-on-weapon-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Grant Smart Seeking and AP only when target has Lock On"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_illusory_subroutines_mirage",
    "sourceFingerprint": "e5a832c58a49b57946176321eff55109f2c02d5c84bcc23be28cf06736eead2d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Quick-tech Sensors targeting"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Native success applies target-specific allied invisibility perception"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Perception restriction expires at target next-turn start"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_impale_cataphract",
    "sourceFingerprint": "cf7794eeac1852a42a611efde0a72dee18f3b22b3c54853d27d4a4e17381af42",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "straight-charge-path",
        "owningChunk": 2,
        "acceptance": [
          "Validate8-space straight movement with pass-through exception"
        ]
      },
      {
        "family": "save-drag-grapple",
        "owningChunk": 5,
        "acceptance": [
          "Choose passed-through or endpoint-adjacent target Hull save difficulty1 then grapple and drag on failure"
        ]
      },
      {
        "family": "charge-resume",
        "owningChunk": 3,
        "acceptance": [
          "Sequence movement save and drag without replay after cancellation"
        ]
      }
    ],
    "unresolved": [
      "Exact save timing relative to passing target requires explicit continuation review."
    ]
  },
  {
    "lid": "npcf_impale_systems_hornet",
    "sourceFingerprint": "c43717d39f76391bdd95bb6aed2de3fe51b8698698d8a6c97e0aad117baff988",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tech-heat-condition",
        "owningChunk": 5,
        "acceptance": [
          "Resolve Sensors tech attack with tier heat and Jammed until target next-turn end"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 5",
          "Reserve quick-tech action cost"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_impaler_sentinel",
    "sourceFingerprint": "3375bb5b45de396fc7102f3f98c9170510993baea97db9dc15a7bfff5c66c7cc",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "reaction-trigger-and-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Confirmed Overwatch hit and once-round restriction"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Hull save gates Immobilized and Jammed"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Conditions expire at target next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_impending_threat_archer",
    "sourceFingerprint": "bec8b67276bd60363dd01f0d2a7e8db6036f6365252962776bcf4f4bfe811ec9",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "movement-action-interrupt",
        "owningChunk": 7,
        "acceptance": [
          "Trigger once per round for visible hostile within10"
        ]
      },
      {
        "family": "opponent-choice",
        "owningChunk": 5,
        "acceptance": [
          "Capture abandon action or movement versus immediate single-weapon attack"
        ]
      },
      {
        "family": "interrupt-resume",
        "owningChunk": 3,
        "acceptance": [
          "Resume triggering activity only from confirmed choice and attack completion"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_industrial_clamps_industrial_mech",
    "sourceFingerprint": "08d3e0f2a9d1ae73da7b7e1c29058459e90cc0b209ea71c269242f1d45cc0500",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "conditional-auto-hit-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Native tier melee damage automatically hits Grappled target"
        ]
      },
      {
        "family": "grapple-accuracy",
        "owningChunk": 6,
        "acceptance": [
          "Add Accuracy only to Grapple"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_instinct_mode_ronin",
    "sourceFingerprint": "2cea918a50d276c5d631e4764c52da527042c493d0f8e83d6a7145a95a57ee9b",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge quick activation"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Mode expires at own next-turn end"
        ]
      },
      {
        "family": "reaction-trigger-and-interruption",
        "owningChunk": 7,
        "acceptance": [
          "First attack-targeting event each turn permits preattack sword reaction with range check"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_insulated_pyro",
    "sourceFingerprint": "24daf9b19e9ca5f63679a6e3735945d0ef89715d085969f7a4e37bd1d398704d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "burn-immunity",
        "owningChunk": 6,
        "acceptance": [
          "Reject Burn application to Pyro"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_insulated_veteran",
    "sourceFingerprint": "c32a836d5c803d35e39533c63c3ad34c7e16ec86cc550f9f24bf418af8af1e62",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "burn-immunity",
        "owningChunk": 6,
        "acceptance": [
          "Reject Burn application to Veteran"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_investiture_priest",
    "sourceFingerprint": "2671f02be69717700c90da81715e247647cfb50fd41cbb21a44a0b55ca449578",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Quick allied mech/vehicle range5 single link"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Tier attack accuracy; optional Systems substitution; symmetric condition propagation and link cleanup"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_javelin_rockets_rainmaker",
    "sourceFingerprint": "d6d19350c46f14dd4b6bf6524dfb80fc6dfc8cb08bf4690256405f6d0fd87f49",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "quick-placement-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action and choose3 visible free nonadjacent spaces within20"
        ]
      },
      {
        "family": "one-shot-hazards",
        "owningChunk": 6,
        "acceptance": [
          "Track per-space single trigger through next turn with hostile crossing start or elevation10"
        ]
      },
      {
        "family": "hazard-damage",
        "owningChunk": 5,
        "acceptance": [
          "Apply tier Kinetic damage on observed trigger"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_juggernaut_berserker",
    "sourceFingerprint": "31e52e70645b9c69d1027d6feed1a8b457151dc971e7a2ef85ec4193813a5ef2",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "charge-path-trigger",
        "owningChunk": 6,
        "acceptance": [
          "Find all allied and hostile characters adjacent to Avalanche Charge path or final position"
        ]
      },
      {
        "family": "hull-save-prone",
        "owningChunk": 5,
        "acceptance": [
          "Capture each Hull save before Prone once per affected character"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_juggernaut_ultra",
    "sourceFingerprint": "8d5dd8bf79e8ffee9ca9c54f5aa2e5dc4e91a0111f067ead99a66af2d914a12b",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Turn-start condition clear and turn-end destroyed item repair"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Explicit condition/item choice and confirmed document change"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_kai_bioplating_assassin",
    "sourceFingerprint": "08008590b7df908650f4a18931f58f16f53f5cf3e4e530aa5b447c741b8cebd5",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "enhanced-movement",
        "owningChunk": 2,
        "acceptance": [
          "Use normal swim climb costs ignore difficult terrain and bound horizontal vertical standard-move jumps"
        ]
      },
      {
        "family": "agility-check-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Add accuracy1 to Agility checks"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_kinetic_compensation_demolisher",
    "sourceFingerprint": "4151bf0160a05606949f81a65a7814e4597e5cb30d336de6d5ab2aa4953b570f",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "miss-stacking-modifier",
        "owningChunk": 6,
        "acceptance": [
          "After confirmed Hammer miss increment Accuracy stack and clear after next confirmed hit"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_lance_shot_cataphract",
    "sourceFingerprint": "5348708ca68cc4f62b08b0f6068990a4bbc60de2156bd545256ec9995f6ad94c",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge full action"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Line5 all-character footprint"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Engineering save gates Jammed"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Jammed expiry at target next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_last_word_mercenary",
    "sourceFingerprint": "ea7fdd939370c204164aad168cc3e4a544a3e565ecbcb55f36185e78ca3457f5",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "hp-threshold-reaction",
        "owningChunk": 7,
        "acceptance": [
          "Trigger only below half HP and reserve one Limited use"
        ]
      },
      {
        "family": "burst1-targets",
        "owningChunk": 4,
        "acceptance": [
          "Enumerate all characters in Burst1"
        ]
      },
      {
        "family": "save-jam-move",
        "owningChunk": 5,
        "acceptance": [
          "Resolve Agility save for damage2 and Jammed on failure then Speed movement with exceptions"
        ]
      },
      {
        "family": "reaction-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Complete save effects before follow-up movement"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_latch_drone_support",
    "sourceFingerprint": "c8e5fa8a8fb75b7f4b4e1c2f0f74ba1749560c624f951083b913883ebdffd543",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "attached-drone",
        "owningChunk": 6,
        "acceptance": [
          "Place tier-stat drone on target within range 3, co-move and permit enemy attacks"
        ]
      },
      {
        "family": "turn-start-healing",
        "owningChunk": 5,
        "acceptance": [
          "Heal tier HP on host turn start"
        ]
      },
      {
        "family": "attached-accuracy",
        "owningChunk": 6,
        "acceptance": [
          "Grant host Accuracy on checks saves and attacks only while attached"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 6",
          "Reserve full action instead of two quick actions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_lay_mines_seeder",
    "sourceFingerprint": "1ed32bdb8bab8e9a1465b2b55d387e29a6035eaca580ab3e23ca371d55434d12",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Once-turn quick mine deployment to free range3 space; disarm quick in same cell"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Blast1 includes allies and enemies"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Four mine save/damage branches; reveal/disarm Systems checks and failed-disarm detonation"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Invisible untargetable deployed mines; hostile traversal trigger; staged condition expiry"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_lead_the_charge_ultra",
    "sourceFingerprint": "7e68208ae2a539d6b33239dfd4624b6569ba55dd28c0454928cf8c0ec9d3bb8d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "unlimited-boost-trigger",
        "owningChunk": 7,
        "acceptance": [
          "Offer Boost after visible hostile movement and preserve unlimited per-round availability"
        ]
      },
      {
        "family": "reaction-boost-path",
        "owningChunk": 2,
        "acceptance": [
          "Validate legal Boost path without assuming unlimited standard actions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_leap_assassin",
    "sourceFingerprint": "7acee2277e4ca1f9cfd90d928db953f61cb150fe3dddfe6bfa93243b4921c5ac",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "flight-leap",
        "owningChunk": 2,
        "acceptance": [
          "Validate six-space flight ending on surface"
        ]
      },
      {
        "family": "landing-save-prone",
        "owningChunk": 5,
        "acceptance": [
          "After completed landing capture adjacent characters Agility saves before Prone"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve one quick action",
          "Block use until authoritative recharge confirms threshold: 5"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_legendary_ultra",
    "sourceFingerprint": "82eeddb8f07984e2526b603b3cc8c49527fd2230ff02b02e845cedaa2fd33beb",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Structure/overheat event replaces one roll with two"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Native double rolls and explicit selected result"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_legendary_veteran",
    "sourceFingerprint": "24e0b1ec1ec85bc79583ce9c5a3c86d3463b6de0cf6ee7707d179ab2ed16cbd1",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "double-check-choice",
        "owningChunk": 6,
        "acceptance": [
          "Roll structure or overheat checks twice natively and require choice of either observed result"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_legion_ultra",
    "sourceFingerprint": "53c5f03a2c42b8f4ae30f363f4bb3b3b880768066ddd7ce8077eb19969707224",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "capped-template-stat",
        "owningChunk": 6,
        "acceptance": [
          "Verify E-Defense capped at 20 without double count and add tech Accuracy"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_lesser_sight_veteran",
    "sourceFingerprint": "6b01bee653dbcb82654c189be4df210836dc38e2f5646e68ba7531284b07e635",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Ignore nearby invisibility; deny new hostile Hide within three without clearing existing Hidden"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_light_laser_aegis",
    "sourceFingerprint": "625a334ca4283b4863740e225b9363b1893b5fdbf3e55658fbfa8fa47a955b69",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "mixed-damage-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Validate Range8 and native tier Energy plus Burn components"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_light_machine_gun_archer",
    "sourceFingerprint": "2bbddb9740038b3d0514ef1b03e219dc3f2a789a72128671fbb7fbc32cc43b39",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "reliable-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Resolve tier native cannon attack and tier Reliable fallback"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_lightning_reflexes_veteran",
    "sourceFingerprint": "09117f521f491c6c7f3dc475df60fa328d13472f5d9861c955b189be9ac2eb37",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Heavy/Superheavy attack pre-resolution dodge trigger"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Native d6 result may force miss"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_limited_handling_vehicle",
    "sourceFingerprint": "23154ef91792ca7289dfb7f5b99ac1dbeb69cafefe3d4664649214b41411f5bb",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "vehicle-path-restrictions",
        "owningChunk": 2,
        "acceptance": [
          "Require straight move and Boost independently prohibit swim climb"
        ]
      },
      {
        "family": "conditional-prone-clear",
        "owningChunk": 6,
        "acceptance": [
          "Permit clearing Prone only adjacent to ally"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_limited_melee_attacks_ship",
    "sourceFingerprint": "229205a4e208963cfab11493af8565a94db7a90db19778598e24c125091f295c",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "melee-action-restriction",
        "owningChunk": 6,
        "acceptance": [
          "Reject every melee attack except Ram"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_limited_melee_vehicle",
    "sourceFingerprint": "28433d871d2dd311e02d1cebcf06b2c0c26baa7bff445323b81f998e0b58c16d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Vehicle melee legality permits Ram only"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_limitless_ultra",
    "sourceFingerprint": "92931e3b5458bd693fef7bb91aee0c4a0f15bec60b6e7db2eb0b2b166f2e77a5",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "overcharge-budget",
        "owningChunk": 2,
        "acceptance": [
          "Grant additional quick action only through Overcharge with native1d6 heat cost"
        ]
      },
      {
        "family": "heat-before-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Observe cost and any overheating interruption before continuing"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_limitless_veteran",
    "sourceFingerprint": "00990805408d911b84ad38f638a9a67f58e5a24e4ade14a3ef809ff83d0341d8",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "overcharge-budget",
        "owningChunk": 2,
        "acceptance": [
          "Grant Overcharge extra action with native d6 heat each time rather than standard escalating heat"
        ]
      },
      {
        "family": "heat-dependent-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Do not infer heat before native roll result"
        ]
      }
    ],
    "unresolved": [
      "Native NPC Overcharge entry point and heat-to-budget transition remain unverified."
    ]
  },
  {
    "lid": "npcf_living_chassis_exotic",
    "sourceFingerprint": "a9f8a792512a91a1b4c026d58016ec514c0566d6a326b4e0c49d05db2ebdc041",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Mech-only selection prerequisite and Biological type conversion"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_living_weaponry_exotic",
    "sourceFingerprint": "4152b6b3f7e1b30550248d2535c580bf98fe79b0ed3084c049872611b57982f5",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "jammed-immunity",
        "owningChunk": 6,
        "acceptance": [
          "Reject Jammed application"
        ]
      },
      {
        "family": "reload-healing",
        "owningChunk": 5,
        "acceptance": [
          "Roll native1d6 healing only when Loading weapon reload completes"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_lock_hold_javelins_hornet",
    "sourceFingerprint": "f4b4aa02a45453fb10d283fa59ef9e699ad95a6f00d533194509af52297de617",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "save-tether-condition",
        "owningChunk": 5,
        "acceptance": [
          "Capture range-5 LOS Hull save before Immobilized and Shredded, permit removal by full action and Hull save"
        ]
      },
      {
        "family": "tether-lifecycle",
        "owningChunk": 6,
        "acceptance": [
          "End tether on replacement or scene end"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve full action instead of two quick actions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_machine_pistol_specter",
    "sourceFingerprint": "0a25f6e6e9e0fc269755170669adf643109b08645dac9b186a04ffee66e0479d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Range5/threat3 tier one/two/three repeated or split attacks"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Each native attack requires confirmed continuation"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_maneuverable_spacer",
    "sourceFingerprint": "e30c83a820bde8bff7d6a49a0c7c31c6d701b123ab79a11e3a5b14ff14846577",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "zero-g-movement",
        "owningChunk": 2,
        "acceptance": [
          "Use normal Spacer movement in zero-g with authoritative environment"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_manifest_false_idols_mirage",
    "sourceFingerprint": "6e8d792570e39974f4cbadb9b2b6d03ca8c126426e5a3fa1668561d26e8844af",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "construct-deployment-lifecycle",
        "owningChunk": 6,
        "acceptance": [
          "Place three passable Size 1 constructs in free visible range-5 spaces with soft cover, consume on transit or teleport"
        ]
      },
      {
        "family": "entry-save-teleport",
        "owningChunk": 5,
        "acceptance": [
          "Capture hostile Systems save for heat and Jammed, allied teleport choice and legal destination"
        ]
      },
      {
        "family": "secondary-action-cost",
        "owningChunk": 2,
        "acceptance": [
          "Validate quick teleport after full-tech creation"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 5",
          "Reserve full-tech action cost"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_marker_rifle_scout",
    "sourceFingerprint": "c3323ae8232e50adb66d7bd22500bf18a62ebb86133179df02f8c3b087673b3d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Smart range15 native attack uses E-Defense"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Hit applies Lock On"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Lock On lifetime controls Shredded and concealment prohibition"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_massive_size_ship",
    "sourceFingerprint": "f793848b5257226243faf9488fdc3efc44c08da46492b39e0ffaab052191c16e",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "size4-footprint",
        "owningChunk": 2,
        "acceptance": [
          "Use actual Size4 Ship footprint on every supported grid"
        ]
      },
      {
        "family": "ship-scale-restriction",
        "owningChunk": 6,
        "acceptance": [
          "Keep larger-ship immunity distinct from this Size4 stat block"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_melee_weapon_human",
    "sourceFingerprint": "aace96d0e1cf6cecdc3929fc81ad72534e337cc55121501168289b8f2922d88a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "native-melee",
        "owningChunk": 4,
        "acceptance": [
          "Verify tier melee damage and Threat 1 with native outcomes"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_melt_scourer",
    "sourceFingerprint": "ae8e44f0ff970bfdc45d3bbbae50155e5e9a27a0b2d0e87a170cfa45d2c25592",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge quick object/deployable/Drone-only range10 target"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Native ranged attack success gates AP20 energy damage"
        ]
      }
    ],
    "unresolved": [
      "Source has no explicit attack-bonus selection for this System attack"
    ]
  },
  {
    "lid": "npcf_mercenary_systems_and_traits_mercenary",
    "sourceFingerprint": "ca3992ed45054d07957fae30cd4c69e850c18339387a2f1c2674fda1e7d4cfab",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "mercenary-loadout",
        "owningChunk": 6,
        "acceptance": [
          "Allow optional selection from Mercenary systems traits list"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_metafold_shove_mirage",
    "sourceFingerprint": "659d6832762c18f3efa3605f1ed4c6aefa15991e947e7ac286c1feab1f83f94f",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tech-position-swap",
        "owningChunk": 5,
        "acceptance": [
          "Resolve hostile range-5 tech hit, visible allied choice and simultaneous legal teleport positions"
        ]
      },
      {
        "family": "flight-state-restriction",
        "owningChunk": 2,
        "acceptance": [
          "Reject swaps between flying and nonflying participants"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve quick-tech action cost"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_micro_missile_barrage_assault",
    "sourceFingerprint": "ac5065a69e2dd0a63d2ed25e728b334706d81db7b976c68b55a5c843a611b24c",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge quick action"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Line8 all-character footprint"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Hull save controls tier kinetic damage halving"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_military_discipline_commander",
    "sourceFingerprint": "daf8517bf878ed5237050d6455134044986faa6b47b8f18a83f39e853e401e4b",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "adjacent-allied-accuracy",
        "owningChunk": 6,
        "acceptance": [
          "Apply accuracy1 to attacks saves checks for adjacent allies"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_missile_launcher_ace",
    "sourceFingerprint": "68556dd3d4ebeeac5c9872409663004b9930c0a815304575b7a5b2789ac34d48",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "smart-seeking-blast",
        "owningChunk": 4,
        "acceptance": [
          "Validate range-10 Blast 1 geometry and native E-Defense attack with Seeking cover exceptions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_missile_pods_rainmaker",
    "sourceFingerprint": "e23566da725cf86b34991f792cc850ccb6c46534d053f86d50c94ea6f07a3f81",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Range20 arcing one-to-three target attacks; tier reliable damage"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Knockback1 legal displacement"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Multi-target native outcome continuation"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_missile_swarm_ace",
    "sourceFingerprint": "eff2cec354a1965962eede11c155e1f648556e5546f93bbda354747594c538cb",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "loading-budget",
        "owningChunk": 2,
        "acceptance": [
          "Require loaded weapon and confirmed reload"
        ]
      },
      {
        "family": "selective-burst-attack",
        "owningChunk": 4,
        "acceptance": [
          "Enumerate Burst5 targets excluding allies and use Seeking"
        ]
      },
      {
        "family": "lockon-double-damage",
        "owningChunk": 6,
        "acceptance": [
          "Double damage only against Lock On targets"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_mobile_printer_barricade",
    "sourceFingerprint": "c057d8f18e07920423f02ad20cb016ad6dc5f87ba14554971862a0fff4daccd2",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "cover-object-deployment",
        "owningChunk": 6,
        "acceptance": [
          "Create adjacent free Size 2 cube with authoritative HP Evasion and hard-cover behavior"
        ]
      },
      {
        "family": "protocol-placement",
        "owningChunk": 2,
        "acceptance": [
          "Validate recharge and protocol cost plus footprint"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 5",
          "Permit only legal protocol timing"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_mobile_turrets_engineer",
    "sourceFingerprint": "23cb814135bd76f9f0757dfb36706537e2d9ebdfc4ef2703ac2e8940db3f8aab",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Owner-turn start permits all deployed turret movement"
        ]
      },
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Each turret path/end within three and legal occupied cells"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_monowire_sword_specter",
    "sourceFingerprint": "e5f4fb1aaf37586aa34cee2c11ccd207b97013c5593203a97639900e4584ebae",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tier-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Use one two three Threat3 attacks by tier with repeated or split targets"
        ]
      },
      {
        "family": "attack-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Require each native result before later attacks"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_motile_swarm_hive",
    "sourceFingerprint": "6966b367da2b93cac1839e3633d86a8728bd88e398c03cf0f18c4721de693b35",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "zone-turn-movement",
        "owningChunk": 6,
        "acceptance": [
          "At Hive turn start move every swarm at most two spaces including occupied destinations"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_moving_target_archer",
    "sourceFingerprint": "b1ee3e19c4e74691cf09defc57ec8318348c7d72fd27fd53b750b920dfd39fe9",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "reaction-trigger-and-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Suppress target begins movement; interrupt before movement with single weapon attack"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_moving_target_sniper",
    "sourceFingerprint": "38392ea4740c311766bec00c6ce9fb132df55fa592a2a6924bebbc9f21407086",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "movement-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Trigger visible moving character within20 once per round"
        ]
      },
      {
        "family": "opponent-choice",
        "owningChunk": 5,
        "acceptance": [
          "Record cancel triggering activity or accept AntiMateriel attack"
        ]
      },
      {
        "family": "loaded-branch",
        "owningChunk": 3,
        "acceptance": [
          "If rifle unloaded reload instead of attack and resume only after confirmed result"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_multiplicity_mirage",
    "sourceFingerprint": "156a6c5648955dcf742443a74d8ced24f7ba635a23e3ea30864453f487b06254",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "ally-hit-reaction",
        "owningChunk": 7,
        "acceptance": [
          "Require visible ally hit once per round"
        ]
      },
      {
        "family": "save-dependent-immunity-teleport",
        "owningChunk": 5,
        "acceptance": [
          "Capture attacker Systems save before attack immunity and ally-chosen up-to-five-space teleport"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Enforce per-round use maximum and refresh exactly once: 1"
        ]
      }
    ],
    "unresolved": [
      "Immunity after the triggering hit needs a native pre-damage interception boundary."
    ]
  },
  {
    "lid": "npcf_mutations_horror",
    "sourceFingerprint": "4769d1f42b4a0340143121ab15fda67de9db48d61eb9da0e570de93d5a3e19c0",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Tier-dependent mutation selection limit"
        ]
      }
    ],
    "unresolved": [
      "Referenced Horror Mutations list requires linked review"
    ]
  },
  {
    "lid": "npcf_nail_gun_berserker",
    "sourceFingerprint": "171765bfe25c9a7a1f78dfcc2a043b624dcdf40f994fa242cedd923bf2916045",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "ranged-threat-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Validate Range5 Threat3 tier native attack"
        ]
      },
      {
        "family": "hit-save-immobilize",
        "owningChunk": 5,
        "acceptance": [
          "After hit capture Agility save and Immobilized on failure until next turn"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_nano_repair_cloud_support",
    "sourceFingerprint": "875d8e776702db10c7ded5f49385e037c8e4bad6b162de622e58cb3a1d59c1ef",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "adjacent-roll-modifier",
        "owningChunk": 6,
        "acceptance": [
          "For adjacent allies use two native save or mech-skill-check rolls and keep higher"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_napalm_bomb_pyro",
    "sourceFingerprint": "c853119fbccde9626674e28b4472f282e35e1ded60ddc5b5c69274148a5dcdf5",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Loading readiness"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Arcing range5 Blast1 native tier Burn/heat attack"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_natural_camouflage_monstrosity",
    "sourceFingerprint": "b965ce2418beb0f14c4322c651830a34901e23e34beb5d7aaa318d4f75d6b953",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "terrain-camouflage",
        "owningChunk": 6,
        "acceptance": [
          "Enable Invisible next to terrain or cover and convert soft cover to hard"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_near_threat_denial_system_bastion",
    "sourceFingerprint": "efdd4224361927008d07eb7a93b606d92c946427ea38a4f3ba0554de75ccc473",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "pre-attack-damage-trigger",
        "owningChunk": 6,
        "acceptance": [
          "Apply tier AP explosive damage before nearby attackers roll against Bastion"
        ]
      },
      {
        "family": "interrupt-before-roll",
        "owningChunk": 3,
        "acceptance": [
          "Revalidate attack continuation if retaliation changes actor state"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_nhp_co_pilot_veteran",
    "sourceFingerprint": "3639afbc2253ba80ebebb80ea6818c0031c2267c29b03621d0eca3b4b30b5064",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "AI tag autonomy without pilot and cascade state"
        ]
      }
    ],
    "unresolved": [
      "PC-AI cascade rules referenced externally and not supplied in this feature"
    ]
  },
  {
    "lid": "npcf_no_manipulators_ship",
    "sourceFingerprint": "dd92df9e77362a316078cc6446ec22bdfc073d0221af3902a436f332c816efa7",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "action-restrictions",
        "owningChunk": 2,
        "acceptance": [
          "Reject object interaction manipulation and Grapple for Ship"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_no_manipulators_vehicle",
    "sourceFingerprint": "96afb62806f37f6fc6b30006883586eabc8221de26746ed0b07fdc4313ff8a52",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "action-restriction",
        "owningChunk": 6,
        "acceptance": [
          "Reject object pickup manipulation environment interaction and Grapple"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_no_pilot_rpv",
    "sourceFingerprint": "4ab5ac40ec4dff892a8f1eb170eff870e115a225ae181f1fc67806fb26e8c78d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Pilot-targeted effect immunity; permanent Impaired; decision limitations"
        ]
      }
    ],
    "unresolved": [
      "Complex-decision and moral-judgment restrictions need explicit noninvented operational boundary"
    ]
  },
  {
    "lid": "npcf_nova_missiles_operator",
    "sourceFingerprint": "01c0f1bfe976e35ff960c02ff34590d83fb3c85d804557fe36e9e27ac6ccca99",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "seeking-blast-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Validate Range15 Blast1 Seeking targets and native tier Energy damage"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_null_perception_coating_spec_op",
    "sourceFingerprint": "2c72ca0f361a6f0000edf7e027886f39209dd35e81714889abee7d2927826236",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "lock-on-immunity",
        "owningChunk": 6,
        "acceptance": [
          "Reject Lock On application from any source"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_operatives_spec_op",
    "sourceFingerprint": "7eff5586085606034f83f5316e03f0b467daf7c9bb1899b7bdb1c998807f696b",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Additional Spec Ops choice list and Grunt/Elite/Ultra exclusion"
        ]
      }
    ],
    "unresolved": [
      "Referenced Spec Ops option list requires linked review"
    ]
  },
  {
    "lid": "npcf_opportunist_mercenary",
    "sourceFingerprint": "33155a67e08d1873d46b1e0391e610386b08739e8277e5814e50fee760c0f4d9",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "engaged-target-accuracy",
        "owningChunk": 6,
        "acceptance": [
          "Add accuracy1 only if target engaged by attacker ally"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_orbital_strike_scout",
    "sourceFingerprint": "4e77273589551cce2904c1fed0859da298e2c716b8450c32652c783eed005ed8",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "round-delayed-strike",
        "owningChunk": 6,
        "acceptance": [
          "Record visible ground point within range 20, public marker and next-round-end trigger"
        ]
      },
      {
        "family": "delayed-burst",
        "owningChunk": 4,
        "acceptance": [
          "Validate Burst 2 footprint at resolution"
        ]
      },
      {
        "family": "save-damage-prone",
        "owningChunk": 5,
        "acceptance": [
          "Capture Agility saves for tier Energy damage and Prone only on failure"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 5",
          "Reserve full action instead of two quick actions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_pain_transference_witch",
    "sourceFingerprint": "aa7300bb50a612600170c2cf7fd0aa2fe43560ff3973c8257c5d06a1623a1a93",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge quick-tech Sensors target"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Native tech success and heat propagation to target allies within five"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Observe each heat gain until Witch next-turn end; prevent duplicate propagation"
        ]
      }
    ],
    "unresolved": [
      "Recursive propagation interaction requires linked rule review"
    ]
  },
  {
    "lid": "npcf_painmaker_breacher",
    "sourceFingerprint": "02fca16a52e56c4f5e5e5560d37cb271961ba984e0098ecaace53721ed239ff3",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "full-action-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge full action and require target within3"
        ]
      },
      {
        "family": "delayed-activation",
        "owningChunk": 6,
        "acceptance": [
          "Delay Breacher next turn until after selected target"
        ]
      },
      {
        "family": "conditional-four-attacks",
        "owningChunk": 4,
        "acceptance": [
          "At delayed turn start if still within3 allow4 Dual Shotgun attacks as free action"
        ]
      },
      {
        "family": "delayed-sequence",
        "owningChunk": 3,
        "acceptance": [
          "Revalidate target range and receipts across round boundary"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_paracausal_weapon_exotic",
    "sourceFingerprint": "205da6514b44b8439776c2f711eb6d70aaea8f4c5b35b0a59afed1b625db8cdf",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "unreducible-weapon-damage",
        "owningChunk": 6,
        "acceptance": [
          "Persist selected Exotic weapon and bypass every damage reduction including Armor and Resistance"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_parting_gift_veteran",
    "sourceFingerprint": "0d6d171e6ffcf59927970ae9d6cf4221eae7a51e3b4a65f7971bc2fb63f932ac",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Quick Self-Destruct activation"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Self-Destruct permission and lifecycle"
        ]
      }
    ],
    "unresolved": [
      "External page reference supplies self-destruct semantics; not present in feature"
    ]
  },
  {
    "lid": "npcf_pause_engine_bastion",
    "sourceFingerprint": "d8cb2d6aff20004136d6228263c9dff36cfa50a3cbd09ac0e157f3be7a939d10",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "full-recharge-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge full action and recharge5"
        ]
      },
      {
        "family": "adjacent-immunity",
        "owningChunk": 6,
        "acceptance": [
          "Protect Bastion and one adjacent ally through next-turn start removing ally immunity on separation"
        ]
      },
      {
        "family": "delayed-stun",
        "owningChunk": 5,
        "acceptance": [
          "At next Bastion turn apply Stunned until following turn"
        ]
      }
    ],
    "unresolved": [
      "Text pronoun leaves whether delayed Stunned applies to both protected characters uncertain."
    ]
  },
  {
    "lid": "npcf_petrify_witch",
    "sourceFingerprint": "1084f0a6047e3d55c2f678429234fc4df647e48021c37324c975d23ed98e728e",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tech-progressive-conditions",
        "owningChunk": 5,
        "acceptance": [
          "Capture Sensors tech hit then Slowed Immobilized and Stunned at successive target turns"
        ]
      },
      {
        "family": "multi-turn-expiry",
        "owningChunk": 6,
        "acceptance": [
          "Expire every condition at final specified turn end"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve full-tech action cost",
          "Block use until authoritative recharge confirms threshold: 6"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_phase_shift_generator_horror",
    "sourceFingerprint": "5429962eae391b8ae31cdf45e04dc081111a9efc88b7fe49a2a6e2fca402b59d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Protocol recharge and previous-turn-use lockout"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Intangible toggle and next-turn-start expiry"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_pin_goliath",
    "sourceFingerprint": "ebc0213213782ed73211c0a95a8467301d47164e9faf51a92290ec8ab8000443",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "quick-targeting",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action and require target within2"
        ]
      },
      {
        "family": "linked-status",
        "owningChunk": 5,
        "acceptance": [
          "Apply target Immobilized Impaired and self Immobilized"
        ]
      },
      {
        "family": "status-expiry-events",
        "owningChunk": 6,
        "acceptance": [
          "Clear on target damaging Goliath Goliath Stunned destruction or new chosen target"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_pirate_systems_and_traits_pirate",
    "sourceFingerprint": "cbb13ded2274ae94a99682fcdbafbc321bd8c7b5ed5577bdf20565c2e401d7be",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "optional-feature-access",
        "owningChunk": 6,
        "acceptance": [
          "Permit Pirate optional list during feature selection without granting every option"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_point_defense_shield_cataphract",
    "sourceFingerprint": "4bae80a12ea5bbb57a330ca3ca81892390be49bff3b33a37fee91d9f889c0a2c",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Resistance only to unique nearest hostile; distance ties remove benefit"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_power_deployer_engineer",
    "sourceFingerprint": "1e38e086e9ed61e42cad94eb24220a6319ba762f5ff2c704238a5173e547e3d1",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "deployment-count-recharge",
        "owningChunk": 6,
        "acceptance": [
          "Allow2 linked turrets and temporarily change recharge to4plus until next successful recharge"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_power_knuckle_goliath",
    "sourceFingerprint": "da70a43f669182c5def760a222694b7be548161e609bdf7844e19ee5a6bb0047",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "save-push-prone",
        "owningChunk": 5,
        "acceptance": [
          "Validate range 2 Hull save, tier kinetic damage and five-space direct push plus Prone on failure"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 5",
          "Reserve one quick action"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_predatory_logic_witch",
    "sourceFingerprint": "8dd7de048c171a8d5350647a4cc926bf73fafdcc7c02066e17ad7ca373b755e3",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge quick-tech Sensors target"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Native tech success requires Witch weapon/target choices"
        ]
      },
      {
        "family": "reaction-trigger-and-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Target immediately performs reaction weapon attack"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Forced attack awaits native success and legal target revalidation"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_press_on_commander",
    "sourceFingerprint": "f200ba7ac5a8b2946d62cbc132a465547d1a181ff7c91d1896f9f3cd888c3e9b",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "quick-recharge-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action and recharge4"
        ]
      },
      {
        "family": "single-condition-clear",
        "owningChunk": 5,
        "acceptance": [
          "Choose Stunned or Jammed on visible allied target"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_press_the_attack_commander",
    "sourceFingerprint": "078334103aee05d5cf476a5ce0001db5c914c32386d25be65e70025111d4e126",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "ally-damaged-trigger",
        "owningChunk": 7,
        "acceptance": [
          "Offer native attack once per round after ally damage"
        ]
      },
      {
        "family": "reaction-attack",
        "owningChunk": 4,
        "acceptance": [
          "Validate target and halve only confirmed successful damage heat or Burn"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Enforce per-round use maximum and refresh exactly once: 1"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_primary_weapon_squad",
    "sourceFingerprint": "67b7d1e58f024bb111b27fdde254153d1c6ddb5ebf963257ff9b77118293b689",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Range5 tier variable-damage attack count reduced from two to one below half HP"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Revalidate HP threshold between attack steps"
        ]
      }
    ],
    "unresolved": [
      "Variable damage type requires configured/native choice; absent from feature"
    ]
  },
  {
    "lid": "npcf_prowl_specter",
    "sourceFingerprint": "6c889ab2233683057c0b4e2b4378af47faee6174b3bc5d089b8829300a5b96d1",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "quick-speed-move",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action validate Speed path with no engagement reactions"
        ]
      },
      {
        "family": "post-move-hidden",
        "owningChunk": 5,
        "acceptance": [
          "Apply Hidden only after confirmed movement"
        ]
      },
      {
        "family": "movement-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Do not apply final status after uncertain or failed movement"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_prying_claws_pirate",
    "sourceFingerprint": "bd35a625c5cbe8c755f8c4a404e511d94c8a13b6481308b6dc0dbe21391eb99c",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "save-dismount",
        "owningChunk": 5,
        "acceptance": [
          "Validate adjacency Hull save before forced pilot exit and authoritative pilot document changes"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Track Limited charges and spend only once on confirmed use: 1",
          "Reserve full action instead of two quick actions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_pulse_laser_scourer",
    "sourceFingerprint": "7a6c34cfa7b2379400f4634b86f08837075d0a60c2c730e287e69af2aeafb067",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Line10 and T2/T3 two attacks with repeated/split target legality"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Continue only from confirmed native attack outcomes"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_punisher_ammunition_sentinel",
    "sourceFingerprint": "3b764e9b1ae6ef7a36e6a9d3fff2013041649116a943198be5e21c3936a4a874",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "overwatch-damage-hook",
        "owningChunk": 7,
        "acceptance": [
          "Identify damage from Sentinel Overwatch only"
        ]
      },
      {
        "family": "on-damage-slow",
        "owningChunk": 5,
        "acceptance": [
          "Apply Slowed until target next-turn end after actual damage"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_quadruped_horror",
    "sourceFingerprint": "a36c8a44dee89f8be2433ce524aebd20a4d6399b5191943e315085da2c1bd038",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "prone-immunity",
        "owningChunk": 6,
        "acceptance": [
          "Reject Prone"
        ]
      },
      {
        "family": "protocol-movement",
        "owningChunk": 2,
        "acceptance": [
          "Offer up-to-four-space movement with legal footprint and protocol budget"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_quick_march_commander",
    "sourceFingerprint": "08f6ca646214d0e6d6c37fbaa1073ad68ad25ba5733f279ea1d5f4fa41a5df82",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Once-round protocol and allied LOS eligibility"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Approved allied Boost continuation"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Apply allied movement with native legal path"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_ram_cannon_cataphract",
    "sourceFingerprint": "db277e82de7d8c3d99f709c01fe290979de6a6b8be42c82de970ce6b5eb3eb42",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "mode-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Permit one chosen ranged or melee mode per turn and2 attacks at T2 T3 with same or split targets"
        ]
      },
      {
        "family": "mode-budget",
        "owningChunk": 2,
        "acceptance": [
          "Persist turn mode exclusivity across separate plans"
        ]
      },
      {
        "family": "attack-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Require confirmed first attack before follow-up"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_rampage_monstrosity",
    "sourceFingerprint": "393f97013759f97d7152e287ff53f08c7e42802d55234f4cef9a94da3a84f63a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "straight-line-charge",
        "owningChunk": 2,
        "acceptance": [
          "Move Speed in straight line through characters ignoring engagement and reactions"
        ]
      },
      {
        "family": "path-adjacency-save",
        "owningChunk": 5,
        "acceptance": [
          "Capture Agility saves for crossed or adjacent characters and native tier kinetic damage"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 5",
          "Reserve one quick action"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_ranged_weapon_human",
    "sourceFingerprint": "cd3ea71413b46a2f8c8d450746e1b17552b725d83698b2a9deae50a37795a407",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Range5 tier kinetic native attack"
        ]
      }
    ],
    "unresolved": [
      "No weapon_type present; action/mount treatment requires reviewed native interpretation"
    ]
  },
  {
    "lid": "npcf_rank_and_file_grunt",
    "sourceFingerprint": "d38c276cf5ee6913e88d8b91ea5a876b1151012e77c21e41f0a942bc39d8ead0",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "template-incompatibility",
        "owningChunk": 6,
        "acceptance": [
          "Reject Veteran Squad Elite Ultra combinations with Grunt"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_rank_and_file_squad",
    "sourceFingerprint": "c480c1241ed79d97551ffafaa5490892d0833123d58c1b84615854cc6f8cb840",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "template-and-stat-restriction",
        "owningChunk": 6,
        "acceptance": [
          "Reject Grunt Veteran Ultra templates and every Structure gain"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_rank_discipline_assault",
    "sourceFingerprint": "f6b390bbe6f0de211acedc93f672ea8c5a145fcf4514d9ef8b1e337028376cad",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Adjacent allied Mech gates attack/check/save accuracy"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_rapid_insertion_squad",
    "sourceFingerprint": "4df6915c92635c0eac12c362e912728ccc71a2a46426cab51d0b35e202579582",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "squad-flight",
        "owningChunk": 2,
        "acceptance": [
          "Permit flying standard movement and Boost with authoritative elevation"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_rapid_response_ace",
    "sourceFingerprint": "c95c4c7428bcfc93fadb5d9d7a596ecd905f293125efda1ea5e471acae788e83",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "movement-triggered-boost",
        "owningChunk": 7,
        "acceptance": [
          "Offer Boost once per round from enemy LOS movement event and validate resulting route"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Enforce per-round use maximum and refresh exactly once: 1"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_rapid_response_archer",
    "sourceFingerprint": "1dc238812ac09860d864ae87e87f2af7236d381d7308f38b41bfacd74e0d3e87",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "reaction-trigger-and-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Enemy LOS movement trigger; once-round reaction Boost"
        ]
      },
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Reaction Boost path legality"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_rapid_response_sentinel",
    "sourceFingerprint": "bb5ea9afcbea5abcd0cee280a52ef002f4ee3ed3f954a326047a0421e8acc9a5",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "after-movement-boost",
        "owningChunk": 7,
        "acceptance": [
          "Trigger only enemy visible movement and offer legal Boost after movement completes"
        ]
      }
    ],
    "unresolved": [
      "Record supplies no explicit per-round frequency."
    ]
  },
  {
    "lid": "npcf_raptor_plasma_rifle_operator",
    "sourceFingerprint": "63dcf5716badadb5ff9f1ac0ef250c5a6dc158e51ea8c81b5bf5773fdfa3ff52",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tiered-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Validate one two or three Rifle attacks by tier and same or split targets"
        ]
      },
      {
        "family": "attack-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Wait for confirmed completed native attack before next attack"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_ravager_turret_ultra",
    "sourceFingerprint": "688f5bfd6188ed2f608eee2cddc1072c73bc95b44ee0e5ede216a55f7b104b64",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Simultaneous attack set includes every hostile in LOS and range10; tier damage"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Preserve simultaneous target set and individual native outcomes"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_razor_swarms_hive",
    "sourceFingerprint": "25f8e89f2e6570124b91d1afb3fad0133945b72ca7a5b41fbaec10622e3cc3b5",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "quick-recharge-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action and recharge4"
        ]
      },
      {
        "family": "razor-zone-placement",
        "owningChunk": 4,
        "acceptance": [
          "Place Blast1 in free area within Sensors and account partial footprints"
        ]
      },
      {
        "family": "persistent-zone",
        "owningChunk": 6,
        "acceptance": [
          "Maintain unlimited zones until scene end or owner destruction with allied soft cover"
        ]
      },
      {
        "family": "zone-burn",
        "owningChunk": 5,
        "acceptance": [
          "Apply tier Burn on hostile turn start or first entry per round"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_ready_and_waiting_elite",
    "sourceFingerprint": "b73d199e26124a2eebf80ac07d9eb393304b0b5647e5e6909c2f0dc08d65d57c",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "multiple-turn-template",
        "owningChunk": 6,
        "acceptance": [
          "Provide two distinct turns each round without duplicating native activation bonus"
        ]
      },
      {
        "family": "separate-turn-budget",
        "owningChunk": 2,
        "acceptance": [
          "Refresh per-turn resources while preserving round counters"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_reality_flicker_mirage",
    "sourceFingerprint": "af802029d72d6909b3ff6078d466b8ed2fa072695e9288cda51b26bc84754aba",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Standard move uses teleport endpoint and movement allowance"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Teleport substitution applies only to standard movement"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_realspace_extrusion_exotic",
    "sourceFingerprint": "5b3cd09a8e81f14daaaa6e91eb2fe95b9441da61f4d00ece1a783d941ffd54e8",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "damage-halving-resistance",
        "owningChunk": 6,
        "acceptance": [
          "Apply all-damage resistance and halve outgoing damage"
        ]
      },
      {
        "family": "shared-occupancy-exception",
        "owningChunk": 2,
        "acceptance": [
          "Permit other characters to pass through and finish in Exotic spaces"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_rebound_ronin",
    "sourceFingerprint": "889e591f10cf51865b4ec6d14b264205e3f73b631408d6b22e78bff88235e7dd",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "ranged-damage-reaction",
        "owningChunk": 7,
        "acceptance": [
          "Offer once per round for actual ranged damage"
        ]
      },
      {
        "family": "roll-gated-reflection",
        "owningChunk": 5,
        "acceptance": [
          "Capture native d6 result before resistance and attacker-self repeat"
        ]
      },
      {
        "family": "reflected-attack-sequence",
        "owningChunk": 3,
        "acceptance": [
          "Pause original resolution until reflected attack state is known"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Enforce per-round use maximum and refresh exactly once: 1"
        ]
      }
    ],
    "unresolved": [
      "Reflection initiated on damage needs native ordering review to avoid applying damage before resistance."
    ]
  },
  {
    "lid": "npcf_rebound_scan_scout",
    "sourceFingerprint": "cbca7ba0a94d4e42e84f7e572f5c2e41ae5fefcc33fe299b179d906bc82ab99d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Full-action selected targets within five"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Systems save gates concealment removal and cover denial"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Concealment/cover restrictions expire at Scout next-turn start"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_reflex_ultra",
    "sourceFingerprint": "33c6e74022d381bfbbb31e1b2cd02790362caa499eb3fc010008599b9902025a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "unlimited-overwatch",
        "owningChunk": 7,
        "acceptance": [
          "Override per-round Overwatch count while retaining legal triggers and timing"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_reflexive_blow_sentinel",
    "sourceFingerprint": "3381490e5e998c0ac2958ea2c4acda03127bd4ef7f5f0b9c546001660f0d40e5",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "ward-attack-interception",
        "owningChunk": 7,
        "acceptance": [
          "Require attack against assigned ward and resolve Overwatch before triggering attack"
        ]
      },
      {
        "family": "interrupt-resume",
        "owningChunk": 3,
        "acceptance": [
          "Revalidate original attack after Overwatch"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_regenerative_shielding_aegis",
    "sourceFingerprint": "cd37c7a31cf48e6eadd563ce0038fe32182429d475328f916e5a65353f9a11d9",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Impaired/Slowed immunity and critical-hit prevention"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_regenerator_exotic",
    "sourceFingerprint": "7a7317616a6fc53ca085a3cb80597777624ca78bed8c7e6212b2ccb2c64c9e61",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "round-energy-history",
        "owningChunk": 6,
        "acceptance": [
          "Track actual Energy damage this round"
        ]
      },
      {
        "family": "conditional-regeneration",
        "owningChunk": 5,
        "acceptance": [
          "At turn end heal quarter max HP only without same-round Energy damage"
        ]
      }
    ],
    "unresolved": [
      "Quarter-HP rounding must use authoritative system rule."
    ]
  },
  {
    "lid": "npcf_regenerator_monstrosity",
    "sourceFingerprint": "307f916203d4fb1061dc9e49e9dea915d740046cdcef4b4a48d191bb02718a1e",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "turn-end-regeneration",
        "owningChunk": 6,
        "acceptance": [
          "Heal quarter total HP at turn end only if no Energy damage earlier in round"
        ]
      },
      {
        "family": "native-healing",
        "owningChunk": 5,
        "acceptance": [
          "Apply HP cap and verified rounding semantics"
        ]
      }
    ],
    "unresolved": [
      "Quarter-HP rounding is not specified in this feature; consult governing rules."
    ]
  },
  {
    "lid": "npcf_reinforced_commander",
    "sourceFingerprint": "21dd2a0a71a82368adb632c3d9ba2c699404d28f340f2be60ad0ee4c89c7d900",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Structure/stress bonuses represented without duplicate application"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_reinforced_elite",
    "sourceFingerprint": "e4e0bd474d0c7a158b6d76f0a612eb7e52168d5b15583572ae48e513b36e9a35",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "elite-structure-stress",
        "owningChunk": 6,
        "acceptance": [
          "Increase Structure and Stress by1 without double counting"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_reinforced_ultra",
    "sourceFingerprint": "fb69c91fe8f04d93d22d0c0d1abc5fd20141c8448814b2d30b555dc3303de97a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "template-stat-bonus",
        "owningChunk": 6,
        "acceptance": [
          "Verify plus-three Structure and Stress already in native actor data"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_reinforced_veteran",
    "sourceFingerprint": "2f79f067b4918ae1302a67d3d585ce6c74c0f275927a9d5faf0187695b4b5d58",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Structure/stress bonuses represented without duplicate application"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_relocation_sniper",
    "sourceFingerprint": "73651f24740f843eaf2fa95bda1a5d53e1e4d23e6cb9f2c887c0eb1683fc4c95",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "relocation-trigger",
        "owningChunk": 7,
        "acceptance": [
          "Once per round on visible enemy movement offer linked Defensive Grapple"
        ]
      },
      {
        "family": "linked-movement",
        "owningChunk": 5,
        "acceptance": [
          "Resolve full Defensive Grapple rules before applying movement"
        ]
      }
    ],
    "unresolved": [
      "Referenced Defensive Grapple mechanics are not reproduced here."
    ]
  },
  {
    "lid": "npcf_remote_cloud_support",
    "sourceFingerprint": "02ffb1062cf1373330bd09ec2b651eefa0a63a6e784951f8d5e6d169a1dcddc5",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "healing-zone-timing",
        "owningChunk": 6,
        "acceptance": [
          "Heal allied start or first own-turn entry in Blast 2, expire at source next-turn start"
        ]
      },
      {
        "family": "zone-placement",
        "owningChunk": 4,
        "acceptance": [
          "Validate range-5 Blast 2 area"
        ]
      },
      {
        "family": "healing",
        "owningChunk": 5,
        "acceptance": [
          "Apply tier HP gain using native cap"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 6",
          "Reserve full action instead of two quick actions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_remote_reboot_support",
    "sourceFingerprint": "683bb9a7b3f904a15e4a471615766438e6ee64b0b6f2e66cb22e53821b9d4755",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge full-action allied target within five"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Choose and clear two present eligible conditions"
        ]
      }
    ],
    "unresolved": [
      "Source says any two; behavior with fewer than two present needs ruling"
    ]
  },
  {
    "lid": "npcf_repeater_cannon_bombard",
    "sourceFingerprint": "cea044583823528b8b58692b43391922aeed014ef44565b489d67ce6be332b0d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "loading-ordnance-budget",
        "owningChunk": 2,
        "acceptance": [
          "Require loaded state and Ordnance ordering"
        ]
      },
      {
        "family": "cone-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Validate Cone5 tier Explosive damage"
        ]
      },
      {
        "family": "knockback",
        "owningChunk": 5,
        "acceptance": [
          "Resolve Knockback3 on confirmed result"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_repulsion_field_ultra",
    "sourceFingerprint": "fe444bf64d51dd91d0b8fe0f6fd2e024c5c61f50a3db54f51429dfdd66538954",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "adjacent-hostile-trigger",
        "owningChunk": 6,
        "acceptance": [
          "Trigger at hostile turn start or first adjacency that turn"
        ]
      },
      {
        "family": "save-damage-heat",
        "owningChunk": 5,
        "acceptance": [
          "Apply tier Energy plus heat and Systems-save Impaired until next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_resilient_ultra",
    "sourceFingerprint": "d686d48c8053a120c8dda5cf328f5379572cc4a419f5a7fa25dd93e43e34bb87",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "HP bonus represented without duplicating actor-computed maximum"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_restock_drone_support",
    "sourceFingerprint": "e392a9152772eaa9273a13b8af6d366c8e11c8b3167d8833d2c6cfa0009534af",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "quick-recharge-drone",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action recharge5 and deploy hovering within5"
        ]
      },
      {
        "family": "single-use-drone-heal",
        "owningChunk": 5,
        "acceptance": [
          "On next ally crossing or adjacency heal tier HP and consume discharge once"
        ]
      },
      {
        "family": "drone-stat-block",
        "owningChunk": 6,
        "acceptance": [
          "Create Size half drone with tier HP5 8 10 and defenses10 12 14."
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_retractable_sword_sentinel",
    "sourceFingerprint": "6d17712d9b24252f4b5181486555c232c0888a6eb2cc0488c40b6d80ac488214",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "native-melee",
        "owningChunk": 4,
        "acceptance": [
          "Validate Threat 1 tier sword attack and damage through native results"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_retribution_berserker",
    "sourceFingerprint": "f6aac1a57c7c52e0b7fe425796d716791e60bb53903ef0c5054df2287b64c23c",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Damage events stack tier next-attack bonus capped at eight; consume on attack or expire next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_retribution_goliath",
    "sourceFingerprint": "061fd3a735212845d29ef02d5f99e232d5b6b8aad167da2d6cfd7b5f127b60a3",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "damage-stack-ledger",
        "owningChunk": 6,
        "acceptance": [
          "Add tier bonus per damage event cap8 consume on next attack or next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_ring_of_fire_aegis",
    "sourceFingerprint": "f7610b2cdfb0092e4a473fa9d42487f2900acdf4dd7afc0014f77da2330b53c4",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "defense-net-hostile-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Apply heat on hostile start or first round entry and Shredded only while inside net"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_rivet_cannon_industrial_mech",
    "sourceFingerprint": "4f9b1c29f198b07ecaf9cb2ea4e0406612619ca471678e3164ecaccf81666220",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Tier one/two/three range/threat3 attacks"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Knockback1 terrain collision gates Immobilized"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Immobilized expiry at target next-turn end"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Native movement outcome precedes next attack"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_rock_drill_industrial_mech",
    "sourceFingerprint": "2524817d3a5370b89f24a58c4aa9d060145fcf1b88b2727bd7c077adb6313690",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "superheavy-budget",
        "owningChunk": 2,
        "acceptance": [
          "Require full action for Superheavy weapon attack independently of terrain quick action"
        ]
      },
      {
        "family": "ap-melee-attack",
        "owningChunk": 4,
        "acceptance": [
          "Validate Threat2 AP tier damage"
        ]
      },
      {
        "family": "hit-prone",
        "owningChunk": 5,
        "acceptance": [
          "Apply Prone on confirmed hit"
        ]
      },
      {
        "family": "alternate-terrain-action",
        "owningChunk": 2,
        "acceptance": [
          "Offer quick action only against adjacent terrain"
        ]
      },
      {
        "family": "terrain-damage",
        "owningChunk": 5,
        "acceptance": [
          "Use confirmed native50 AP Kinetic terrain damage"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_rodeo_master_veteran",
    "sourceFingerprint": "4cd65b1434753c3b2c834a890e87808d4d16c1fabbfbe5a9e3ac1d0e8c1e48e9",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "pilot-class-transition",
        "owningChunk": 6,
        "acceptance": [
          "Create or select Human class state on Dismount and expose pilot actions including Jockey"
        ]
      },
      {
        "family": "actor-transition-sequence",
        "owningChunk": 3,
        "acceptance": [
          "Revalidate control and actor linkage before next step"
        ]
      }
    ],
    "unresolved": [
      "Full pilot action scope and Human transition reference require additional source review."
    ]
  },
  {
    "lid": "npcf_rotary_grenade_launcher_bastion",
    "sourceFingerprint": "3346119b962440574f61065b63562775aeb20a5c331ebb9826cdfa69e83058ae",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Loading readiness"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Arcing range8 Blast1 tier explosive native attack"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_sanctuary_priest",
    "sourceFingerprint": "e1f405448fedb87bdf68c0577b91768cd25a28a779b901503b2332b080434b0f",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "full-tech-target",
        "owningChunk": 2,
        "acceptance": [
          "Charge full tech and choose ally within Sensors"
        ]
      },
      {
        "family": "pre-attack-save",
        "owningChunk": 5,
        "acceptance": [
          "Capture Systems save before each targeting attempt"
        ]
      },
      {
        "family": "target-lockout",
        "owningChunk": 6,
        "acceptance": [
          "Reject failed attacker targeting again until attacker next-turn start"
        ]
      },
      {
        "family": "nonattack-tech-flow",
        "owningChunk": 5,
        "acceptance": [
          "Use full tech activation without inventing EDefense attack roll because tech_attack is false."
        ]
      }
    ],
    "unresolved": [
      "Effect duration and termination absent from this record."
    ]
  },
  {
    "lid": "npcf_sap_assassin",
    "sourceFingerprint": "b20e37729319e43e0d0213c84c242b16da17236925d2726758065a545e32a58f",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "adjacent-save-condition",
        "owningChunk": 5,
        "acceptance": [
          "Validate adjacent target and Engineering save before Stunned until target next-turn end"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve quick-tech action cost",
          "Block use until authoritative recharge confirms threshold: 5"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_sap_demolisher",
    "sourceFingerprint": "a8d5cfe8276bed33f4e58b57b2d2b2c93c85b24989ea7d18efa17b926eb872b4",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge quick-tech adjacent target"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Engineering save directly gates Stunned without a tech-attack roll"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Stunned expiry target next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_scout_drone_mercenary",
    "sourceFingerprint": "3c1aa2e3b80b17ab2097ad5b7b5d335f331541589c920205bf19e62fc2dc34af",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "limited-drone-placement",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action Limited1 and free Sensors destination allow protocol relocation"
        ]
      },
      {
        "family": "reveal-aura",
        "owningChunk": 4,
        "acceptance": [
          "Verify Burst2"
        ]
      },
      {
        "family": "reveal-accuracy",
        "owningChunk": 6,
        "acceptance": [
          "Forbid Hide Invisible and remove existing conditions while boosting owner accuracy inside"
        ]
      },
      {
        "family": "drone-stat-block",
        "owningChunk": 6,
        "acceptance": [
          "Create Size half drone HP10 Evasion10 EDefense10 and enforce relocation continuity."
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_sealant_gun_support",
    "sourceFingerprint": "18fe0c3c64e9fba6acfa0d1999bb155ba45c73e6f1f9fcf497356a9a29c169dc",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "allegiance-effect-branches",
        "owningChunk": 5,
        "acceptance": [
          "Clear allied Burn with Slowed, or hostile Agility-save Slowed"
        ]
      },
      {
        "family": "persistent-terrain-area",
        "owningChunk": 4,
        "acceptance": [
          "Create hostile-centered Burst 1 difficult terrain regardless of save through scene end"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve one quick action"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_sealant_trap_spacer",
    "sourceFingerprint": "bd95cdc77dbd0c7946acb37452b6acf43f1447a931815cfeee9e5d7a776551fc",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Limited quick mine deployment"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Hostile adjacency detonation produces Burst1"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Immobilized removal requires confirmed sealant damage against tier HP/Evasion5"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Track mine trigger and per-target sealant state"
        ]
      }
    ],
    "unresolved": [
      "Mine deployment range/space policy absent from source; requires mine general rules"
    ]
  },
  {
    "lid": "npcf_seeker_cloud_hive",
    "sourceFingerprint": "21d1eae594a0f380414021edf2009a5d4d5a408ef61a484955797b37b368eb77",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "smart-cone",
        "owningChunk": 4,
        "acceptance": [
          "Validate Cone5 EDefense attacks and tier Kinetic damage"
        ]
      },
      {
        "family": "on-damage-lockon",
        "owningChunk": 5,
        "acceptance": [
          "Apply Lock On only to characters actually damaged"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_seismic_destroyer_demolisher",
    "sourceFingerprint": "ab3947d6860b8f3da17c451658ffe21663075cfdcfc8384c8b5c10ad33a91a99",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "cone-or-line-choice",
        "owningChunk": 4,
        "acceptance": [
          "Offer Cone 3 and Line 5 separately and exclude characters able to fly"
        ]
      },
      {
        "family": "save-condition",
        "owningChunk": 5,
        "acceptance": [
          "Capture Agility save before Stunned until target next-turn end"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 6",
          "Reserve full action instead of two quick actions"
        ]
      }
    ],
    "unresolved": [
      "Whether able-to-fly excludes grounded flight-capable characters needs governing-rule review."
    ]
  },
  {
    "lid": "npcf_seismic_repulsor_barricade",
    "sourceFingerprint": "2b7b9d23c23504417ab96031b547b35b13d36f8cd6da92245ce988a1a2ed40dc",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge quick activation"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Burst3 excludes flying characters"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Hull save gates push3 away from origin and Prone"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Area becomes difficult terrain until scene end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_selective_loader_sniper",
    "sourceFingerprint": "12d22c634d1ccf2b7b4279927f40fd4f69e1f0088db06100459753318f14d563",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "ammunition-choice",
        "owningChunk": 6,
        "acceptance": [
          "Select one ammo before AntiMateriel attack and preserve native base attack"
        ]
      },
      {
        "family": "ammo-save-effects",
        "owningChunk": 5,
        "acceptance": [
          "On success capture selected Systems Hull Engineering save or reveal effect with next-turn expiry"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_self_erasure_operator",
    "sourceFingerprint": "6db84bfb5e66a87af5070c519a81bdeba33286d3a2556a5ceafdb21d711ba06e",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "destruction-trigger-lifecycle",
        "owningChunk": 6,
        "acceptance": [
          "On actual destruction resolve adjacent save damage then annihilate mech document once"
        ]
      },
      {
        "family": "save-damage",
        "owningChunk": 5,
        "acceptance": [
          "Capture Agility save for tier Energy damage or half"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_self_repair_veteran",
    "sourceFingerprint": "0ff94bdbfda3e97c3d966c63b4841cff8ed1c4e3fdcb797cd4b912394c6e3fb2",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Once-scene full-action reservation"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Restore all HP and clear all conditions using confirmed updates"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_serrated_machete_spec_op",
    "sourceFingerprint": "296f11608015a8aedb248dd65421dbaca88888d9444d665b09c144eb75a8677a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "thrown-melee",
        "owningChunk": 4,
        "acceptance": [
          "Validate Threat1 or Thrown5 native attack and tier damage"
        ]
      },
      {
        "family": "critical-status",
        "owningChunk": 5,
        "acceptance": [
          "Apply timed Shredded only from confirmed critical"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_shepherd_field_engineer",
    "sourceFingerprint": "6bca4070a4e3cccd20f08d5432466dd0d7c305d18365617b64952503d43a5dfe",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "adjacent-object-resistance",
        "owningChunk": 6,
        "acceptance": [
          "Grant all-damage resistance to adjacent drones objects and cover and remove after separation"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_shock_and_awe_ultra",
    "sourceFingerprint": "f26aac862165b89a7fd6e45c37c6f8e7acf89332e977fcb132e0d0d030a79eec",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Two turns or three from initial five-hostile threshold; avoid double stat activation bonus"
        ]
      },
      {
        "family": "reaction-trigger-and-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Refresh spent reactions each turn"
        ]
      },
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Separate per-turn budgets from round counters"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_shock_armor_demolisher",
    "sourceFingerprint": "b2039103d57fd1883a4c53089ae9aba825c756228e2d902bd22516fc75a77832",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "melee-resistance",
        "owningChunk": 6,
        "acceptance": [
          "Apply resistance only to melee-weapon damage"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_shock_armor_veteran",
    "sourceFingerprint": "ee759097312071397528a2b6976522010a5dccf109a107f0485354e4dfe662fb",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-category-resistance",
        "owningChunk": 6,
        "acceptance": [
          "Grant damage resistance only to Main weapon attacks"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_shock_plating_barricade",
    "sourceFingerprint": "da0e3be1d264614380ffdd93a8a3e0214779f62634f7675eb3f26ab8ba83a325",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Kinetic resistance applies to native damage context"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_short_cycle_lance_ultra",
    "sourceFingerprint": "2939801c7d21a10632b4192d80505170f3d5f2cfdaf040ace19872eb89592603",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "full-ordnance-recharge",
        "owningChunk": 2,
        "acceptance": [
          "Charge full action recharge6 and Ordnance order"
        ]
      },
      {
        "family": "line30-targets",
        "owningChunk": 4,
        "acceptance": [
          "Validate affected characters and object Size thresholds"
        ]
      },
      {
        "family": "structure-save",
        "owningChunk": 5,
        "acceptance": [
          "Agility failure deals1 Structure success sets HP1 and objects below Size5 destroyed through native receipts"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_shroud_charge_sniper",
    "sourceFingerprint": "3bb0366c3550c2cbe32574660f2e45317507586dc52c991a70e16613c481f15e",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "concealment-zone",
        "owningChunk": 4,
        "acceptance": [
          "Validate Burst 3 partial-footprint boundary"
        ]
      },
      {
        "family": "asymmetric-los-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Apply source-only soft cover and other-character LOS restriction until expiry or replacement"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 5",
          "Reserve one quick action"
        ]
      }
    ],
    "unresolved": [
      "Partial overlap LOS semantics for large footprints need explicit source and native conformance."
    ]
  },
  {
    "lid": "npcf_siege_armor_bombard",
    "sourceFingerprint": "db503733d60569bb2ea0fa7059a3e389c3322544dede298c69005f821a70276d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Damage resistance requires attack-origin distance greater than three"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_siege_armor_goliath",
    "sourceFingerprint": "f7549bfde2062e38019611bcab1ecf68fa1f13bccad3c48e2954edeef01488ef",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "distance-resistance",
        "owningChunk": 6,
        "acceptance": [
          "Grant resistance only to attacks originating beyond3 using correct origin"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_siege_armor_pyro",
    "sourceFingerprint": "7b5aeab4795108bc782044505206d019e5d0b9cc5f47be39d27db287a6a5bc92",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "distance-based-resistance",
        "owningChunk": 6,
        "acceptance": [
          "Grant all-damage resistance only to attacks originating beyond range 3"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_siege_guardian_bastion",
    "sourceFingerprint": "58ace7a6c6dc94c90b4214911c9d2362b8043e6c4d5d413854ca94fb9a44f31f",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Adjacent allied area-attack damage resistance; check four area shapes"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_siege_shield_ultra",
    "sourceFingerprint": "09b85c21d1ab5351dcfbfd39e063defd57860cf72e6560e5abe2455fb08dc38c",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "distance-resistance",
        "owningChunk": 6,
        "acceptance": [
          "Grant resistance only to attacks originating beyond3 using correct origin"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_sight_scout",
    "sourceFingerprint": "977afefda330cec1d974c442172dcd0d217da4f5c842aa64d76e6866276f5c50",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "sensor-detection",
        "owningChunk": 6,
        "acceptance": [
          "Know precise locations through Hidden and Invisible only within Sensors"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_sight_ultra",
    "sourceFingerprint": "2c4f527262223f75c41837a93028536ad406006f444d4cf1bb39665b280fc2df",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Ignore Invisible; prohibit hostile Hide within Sensors"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_skirmisher_operator",
    "sourceFingerprint": "681b6b86a5cba8877ad9c4b46e658a0e59e3dd91c8be175157eb5f9412c8a853",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "free-boost-counter",
        "owningChunk": 2,
        "acceptance": [
          "Allow one free Boost at any point on own turn"
        ]
      },
      {
        "family": "intra-turn-placement",
        "owningChunk": 3,
        "acceptance": [
          "Sequence Boost before between or after actions with revalidation"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_skyshield_protocol_engineer",
    "sourceFingerprint": "4e55457715295267eb96eaeea909535cab726cdcdd9fd2fee5b31b279ceadcb6",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "controlled-turret-accuracy",
        "owningChunk": 6,
        "acceptance": [
          "Apply plus-two Accuracy against flying targets to Engineer-owned deployable turrets"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_slaver_signal_pirate",
    "sourceFingerprint": "a1c3e493c7b2db95ae0bb100d67bb47380783432eef314df224784f4eb545f34",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Recharge full action; piloted mech/vehicle range10; adjacent full-action recovery check"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Systems save gates pilot/passenger Stunned and non-AI carrier Stunned"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Damage or successful recovery check or Pirate destruction clears linked effect"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_slippery_veteran",
    "sourceFingerprint": "38c58a583047de37c9ac3fff21725a178c6609b27b2437c243eb1afec268e634",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "standard-move-exception",
        "owningChunk": 2,
        "acceptance": [
          "Remove engagement and reaction provocation only for standard movement"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_slivershielding_ultra",
    "sourceFingerprint": "b90b627046b43f3b217fc9d3e48d2a05ff1f6d2c057533c5cb4af93f23263e58",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "replacement-permanent-status",
        "owningChunk": 6,
        "acceptance": [
          "Replace Resilient rather than stacking it and maintain permanent Invisible"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_snipers_mark_sniper",
    "sourceFingerprint": "1c4c63281ba379694fa8d3f0573531577282f3665f2a3bcc80423275bb986e9d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Full-action LOS range25 mark or transfer; single mark"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Marked rifle target takes structure instead of normal damage unless covered/Prone; free Prone choice"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Native structure damage result and explicit target defensive choice"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_soldiers_squad",
    "sourceFingerprint": "d5ecfc8bd5e0ae7b335151592752c169c3c1c3f416f920f24dbbaf7847e13a7f",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "squad-hp-members",
        "owningChunk": 6,
        "acceptance": [
          "Treat Squad as one character and derive declining attacks from weapon profile and current HP"
        ]
      }
    ],
    "unresolved": [
      "Exact attack thresholds require linked weapon profile review; do not infer from member count."
    ]
  },
  {
    "lid": "npcf_spacer_systems_spacer",
    "sourceFingerprint": "53deb92cc9e2479b6abaacc47e3359bff57c5d335b8aa434aef1e1d05ad51a9b",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "optional-feature-access",
        "owningChunk": 6,
        "acceptance": [
          "Permit Spacer optional list during feature selection without granting every option"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_special_munitions_spec_op",
    "sourceFingerprint": "7e5662b59fd2a82fa5b1ac347218fc78621febf8117835045709cf47f4a713fd",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Ranged critical applies Prone; preattack kinetic/energy/explosive substitution choice"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_specialist_kit_elite",
    "sourceFingerprint": "bb3675e2f37f433326b16b98922ad51d21f1241932cb5ac967547ef469d967ee",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "elite-loadout",
        "owningChunk": 6,
        "acceptance": [
          "Require one additional optional class system"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_speed_deployer_seeder",
    "sourceFingerprint": "56ce47540f665dad0c45fd4b82316d85efe1d058c4dee5baa95853aa9ace3dc0",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "deployment-count-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Replace Lay Mines deployment count with two and validate both placement choices"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_spined_monstrosity",
    "sourceFingerprint": "c104a4d22257acc15fdf274adc408ee9a69f500ea12c13b5154227ea36f06022",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Post-melee-damage trigger against actual attacker"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Tier AP kinetic retaliation without an attack roll"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_spinning_kick_assassin",
    "sourceFingerprint": "28e03204e4be1d1677938ed87064bcf4aec318cce0ccb194f5c8b2eb512577d7",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "quick-action-target",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action and choose adjacent character"
        ]
      },
      {
        "family": "save-push-prone",
        "owningChunk": 5,
        "acceptance": [
          "Hull failure permits legal4-space push away and Prone"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_splinter_rounds_pirate",
    "sourceFingerprint": "46e3dfaee1ae0f744c9d843fdcab5f03a7ef2aa853fe31b2276daa374f806221",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "critical-damage-modifier",
        "owningChunk": 6,
        "acceptance": [
          "Add three native bonus damage only on confirmed critical hits"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_spotter_scout",
    "sourceFingerprint": "a3bde2e65d98de99cbb948feedce7e3a2f0fc9799f43c69e562f3d49f6300243",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Adjacent allied characters receive attack accuracy"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_spread_out_squad",
    "sourceFingerprint": "1708da046194c46512b955b294d2559012e77a11574a2283cdbb75504f4daa05",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "squad-overlap-footprint",
        "owningChunk": 2,
        "acceptance": [
          "Allow pass-through shared endpoints and squad overlap only with at least2 free occupied spaces"
        ]
      },
      {
        "family": "squad-action-restrictions",
        "owningChunk": 6,
        "acceptance": [
          "Reject Grapple and Ram"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_spread_suffering_witch",
    "sourceFingerprint": "d6270290fb45f41d8a912b31c5d2d0dbc1fd258bf1014e13d6ddf9e71f0713a8",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "free-tech-repeat",
        "owningChunk": 3,
        "acceptance": [
          "Repeat selected Quick or Full Tech once per round as free action against adjacent-to-primary target only after source use confirmed"
        ]
      },
      {
        "family": "tech-repeat-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Validate full repeated option and collect all required native outcomes independently"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Enforce per-round use maximum and refresh exactly once: 1",
          "Represent free-action availability without spending quick actions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_ssc_flight_system_ace",
    "sourceFingerprint": "affe3bac21fbe535b909d64d12298887effeeb3b12ba8c93457b40bb51fcfb46",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Flying move/Boost paths and endpoints"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Passive flight permission"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_ssc_total_suite_hornet",
    "sourceFingerprint": "826fc4558eb983b73af93d05ef9f80a9f34ccd9dcc1d8988a65fcb2c234c6666",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "hover-movement",
        "owningChunk": 2,
        "acceptance": [
          "Permit hover on move and Boost with authoritative elevation"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_stampede_defense_berserker",
    "sourceFingerprint": "d5e5a8c6150a5992f642868c8af98144fc3978b7b20ba8181562c458199510c2",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "condition-gated-resistance",
        "owningChunk": 6,
        "acceptance": [
          "Grant all-damage resistance only while none of six listed disabling conditions apply"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_steel_jaw_veteran",
    "sourceFingerprint": "4f8e69ab749a9942df283b8e41126e49ccf167a95e3246370d19914b6a02b612",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Auxiliary-weapon damage capped at one"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_step_operator",
    "sourceFingerprint": "79a842d643ac81bfc0cdf206455604d959c2818883ae0c4885fca834e7103f15",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "quick-recharge-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action and recharge5"
        ]
      },
      {
        "family": "teleport-destination",
        "owningChunk": 5,
        "acceptance": [
          "Require free visible destination within50 and confirmed teleport receipt"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_step_specter",
    "sourceFingerprint": "48974e596ea6ae5264d10169bb18786672776e46320ded695335214c71305b50",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "teleport",
        "owningChunk": 5,
        "acceptance": [
          "Validate free visible destination within range 50 and recheck footprint at execution"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Block use until authoritative recharge confirms threshold: 5",
          "Reserve one quick action"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_stinger_pistol_hornet",
    "sourceFingerprint": "c51a4943f9ad79e09702a838b0d9a70368c86529e9e4e4266c6aed8019db78fe",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Range8/threat3 tier energy attack"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Confirmed hit applies Impaired"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Impaired expires at target next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_strafe_ace",
    "sourceFingerprint": "1fb33934f7c0f2244417bb65466829388fab2cef23734736f7ddee84ad6e3409",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "quick-round-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action once per round"
        ]
      },
      {
        "family": "flight-path",
        "owningChunk": 2,
        "acceptance": [
          "Validate Speed-length flight path with elevation"
        ]
      },
      {
        "family": "path-damage",
        "owningChunk": 5,
        "acceptance": [
          "Choose one character under or adjacent to path and apply tier native Kinetic damage"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_strength_in_numbers_squad",
    "sourceFingerprint": "26069579562641b9ed000b8f30679169031cb1edf72479f93382703e91e7af91",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "area-based-resistance-immunity",
        "owningChunk": 6,
        "acceptance": [
          "Apply resistance only against nonarea attacks and reject Grapple Ram Knockback and Stunned"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_supercharged_scourer",
    "sourceFingerprint": "792e581e24abaa5021902a88aa84a4b60584d3735424a0e1c1e59ec0ba7a8f16",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Focus Down eligibility additionally imposes Shredded/Slowed until target next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_superfluous_extremeties_horror",
    "sourceFingerprint": "4c0ec7017fe33f5dbb5e9cab46b0e879598c605364f6bdacaf46bf53a8378cea",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "grapple-accuracy",
        "owningChunk": 6,
        "acceptance": [
          "Add accuracy1 to Grapple"
        ]
      },
      {
        "family": "improvised-cost",
        "owningChunk": 2,
        "acceptance": [
          "Permit Improvised Attack as quick action with ordinary remaining legality"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_superhot_berserker",
    "sourceFingerprint": "9b91797f9bf294bd0f639b59cc5e843a3b6cf83109c0a85b695b19e9cd3591d3",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "melee-damage-reaction",
        "owningChunk": 7,
        "acceptance": [
          "Offer once per round on native melee damage"
        ]
      },
      {
        "family": "resistance-save-burn",
        "owningChunk": 5,
        "acceptance": [
          "Apply attack resistance then Engineering-save tier Burn on attacker"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Enforce per-round use maximum and refresh exactly once: 1"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_superhot_pyro",
    "sourceFingerprint": "cfb7482a50e02039d3ff2ce8ad155de701d2ab7360f8b62b1c827530f3ffb9cf",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "reaction-trigger-and-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Melee damage trigger; once-round reaction"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Resistance applies to triggering attack"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Attacker Engineering save gates tier Burn"
        ]
      }
    ],
    "unresolved": [
      "Post-damage trigger versus resistance to same attack requires verified native timing"
    ]
  },
  {
    "lid": "npcf_superior_construction_ultra",
    "sourceFingerprint": "efc72af037e578418f47c3bea2922e881a1998ec48c99b64afd0107fa1fbf433",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "resistance-selection",
        "owningChunk": 6,
        "acceptance": [
          "Replace Resilient select one listed type and enforce maximum2 permanent resistant types across systems"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_superior_frame_ultra",
    "sourceFingerprint": "d11767b2e25ee424e177beb169447ae4b4ddfeb710d5d50646af58c6588052b9",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "condition-immunity",
        "owningChunk": 6,
        "acceptance": [
          "Reject Slowed Shredded and Immobilized"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_superior_ram_breacher",
    "sourceFingerprint": "1203788b589f0d7fe77b840ec215d4817d0f8c35650695e3a5f596064600cd79",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Breach Ram gains four movement and one save difficulty"
        ]
      },
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Extend linked movement allowance without altering remaining path restrictions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_superior_reactor_ultra",
    "sourceFingerprint": "b536e29ddd04077cd24ccd64896c6e6fd6c8009ab8e3dff51d67638e5482e44d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "condition-immunity",
        "owningChunk": 6,
        "acceptance": [
          "Reject Stunned and Exposed"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_superior_sentinel_archer",
    "sourceFingerprint": "2a1eb42e18b7fb8ee7dccfdaab0e7c1c9e4928f0dc618621c96e4c7fde97684b",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "reaction-attack-accuracy",
        "owningChunk": 6,
        "acceptance": [
          "Grant plus-one Accuracy only to attacks actually made as reactions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_superior_targeting_ultra",
    "sourceFingerprint": "5d1a7195746e6564fda90d2b549046e55dc9194c5b8eff9b53a6b9ce2acb3219",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Ranged attacks ignore cover"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_supersonic_hornet",
    "sourceFingerprint": "6c4ef554e178bad812cf0e73dbc7bc4e4c61fea6d7b1abbbcaa1f78ccaf4e68d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "full-action-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge full action"
        ]
      },
      {
        "family": "teleport-flight",
        "owningChunk": 5,
        "acceptance": [
          "Require visible destination within50 using teleport movement semantics"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_suppress_archer",
    "sourceFingerprint": "20c322d3b865a5baef26c9115cbb9adde4c8f6ee67fa5a88dc6bdd3d78563aa6",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "targeted-condition",
        "owningChunk": 5,
        "acceptance": [
          "Apply Impaired to visible range-10 chosen target"
        ]
      },
      {
        "family": "reaction-grant",
        "owningChunk": 7,
        "acceptance": [
          "Enable Moving Target only while suppression active"
        ]
      },
      {
        "family": "suppression-lifecycle",
        "owningChunk": 6,
        "acceptance": [
          "End on each listed LOS damage source-status replacement use or free-action event"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve one quick action"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_supreme_maintenance_ultra",
    "sourceFingerprint": "b66f99407a29c35e4bf37a758f8ea84980025f55c8ec78df9756ee4595d89945",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Jammed immunity"
        ]
      },
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Own-turn free reload one Loading weapon and quick destroyed-item repair"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Confirmed readiness/repair updates"
        ]
      }
    ],
    "unresolved": [
      "Free reload per-turn frequency is not explicit; do not invent repeat limit"
    ]
  },
  {
    "lid": "npcf_supreme_melee_ultra",
    "sourceFingerprint": "a7fd511e8605737c168ee6cf39f77137912a5633c6341ff50afc5ef091d8b105",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "melee-accuracy",
        "owningChunk": 6,
        "acceptance": [
          "Add accuracy1 to melee attacks"
        ]
      },
      {
        "family": "free-action-choice",
        "owningChunk": 2,
        "acceptance": [
          "Once on own turn choose Grapple Ram or melee attack free"
        ]
      },
      {
        "family": "free-melee-attack",
        "owningChunk": 4,
        "acceptance": [
          "Use native legal attack without multiplying count"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_swift_monstrosity",
    "sourceFingerprint": "8aa5eb40b84654ca9cad11048aa7f67e44ad8f96357eac999eee215062e14671",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "free-boost-budget",
        "owningChunk": 2,
        "acceptance": [
          "Permit free Boost only during source turn once per round with legal route"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Represent free-action availability without spending quick actions",
          "Enforce per-round use maximum and refresh exactly once: 1"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_system_flayer_scout",
    "sourceFingerprint": "3eafbff100a4b366072a0729a3994068cec2e4754a34789fbdf2e749db9246ed",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Link to failed Rebound Scan save"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Apply Lock On and tier heat only on failed source save"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_tactical_cloak_specter",
    "sourceFingerprint": "904876d29e228475c4a8db9f8e0268be668d5d73fbfbb9e8300e89061f4d5532",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "permanent-invisibility",
        "owningChunk": 6,
        "acceptance": [
          "Apply permanent Invisible while preserving native hit-check flow"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_tear_down_witch",
    "sourceFingerprint": "90e97d4eee6e75d6417e3dcadb6fafe7fbbf6d3e27c4086f658d3897e421d843",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tech-delayed-heat",
        "owningChunk": 5,
        "acceptance": [
          "Resolve Sensors tech hit for immediate tier heat and later four heat"
        ]
      },
      {
        "family": "source-turn-delayed-effect",
        "owningChunk": 6,
        "acceptance": [
          "Apply delayed heat exactly at Witch next-turn start"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve quick-tech action cost"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_telefrag_operator",
    "sourceFingerprint": "baf8efe93d84cea5c489204e83dc664480908f0bf1150c89bd4ab1397e915e99",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Full-action occupied LOS range15 destination; final free adjacent placement"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Agility save gates tier AP energy damage and Jammed; native self-d6 damage regardless"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Jammed expiry at target next-turn end"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Save and self-damage receipts precede final placement"
        ]
      }
    ],
    "unresolved": [
      "No explicit behavior when no adjacent free space exists"
    ]
  },
  {
    "lid": "npcf_tempered_hide_monstrosity",
    "sourceFingerprint": "317a3421ee6e5fcb4e43a84c8b55daf35d3e7ae44b132ed34087eb2423396352",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "hp-threshold-resistance",
        "owningChunk": 6,
        "acceptance": [
          "Select2 physical Energy Explosive resistance types lose at half HP or less and restore at full HP only with Structure"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_terrifying_horror",
    "sourceFingerprint": "161d1294ef10202af467d77bd68e89b596d492320349df738841e06007110b07",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "los-dependent-difficulty",
        "owningChunk": 6,
        "acceptance": [
          "Apply one Difficulty to attacks against Horror when attacker has LOS"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_thermal_charge_breacher",
    "sourceFingerprint": "130eea4edf05ae0c320711cb413d117b5e7679fd03424c603dda710e019b0509",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Limited quick grenade at range5"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Blast2 affected character/object/deployable sets"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Agility save halves tier Burn; separate tier AP kinetic to objects terrain deployables"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_thermal_lance_scourer",
    "sourceFingerprint": "d7cc9f23042fdd84febe68ad02f409d1b7b72597e1df8183f38960bb93fb8d78",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "ranged-energy-weapon",
        "owningChunk": 4,
        "acceptance": [
          "Validate Range8 tier native damage"
        ]
      },
      {
        "family": "self-heat-cost",
        "owningChunk": 2,
        "acceptance": [
          "Reserve self heat4 and observe native overheat interruptions before follow-up"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_thumper_grenades_spacer",
    "sourceFingerprint": "fefe59b86d0bc0eef6920a504e240c4a78973fd58e2e4b4f4e7abba6b277fd8e",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "grenade-blast",
        "owningChunk": 4,
        "acceptance": [
          "Validate range-5 Blast 1 and one Limited charge"
        ]
      },
      {
        "family": "check-knockback-collision",
        "owningChunk": 5,
        "acceptance": [
          "Capture Agility check before three-space radial Knockback and collision-dependent Prone"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Track Limited charges and spend only once on confirmed use: 1",
          "Reserve one quick action"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_titan_snare_drone_barricade",
    "sourceFingerprint": "538dd05a16a87e463dd3f3633280ed4a052b93007908c7a28755215eb4ce208d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Limited quick deployment to free adjacent Size-half space"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Tier drone stats; hostile entry/start within three applies Immobilized until drone destruction"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Confirmed condition application and destruction cleanup"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_trace_drive_operator",
    "sourceFingerprint": "34b10696367e5079bac927c9068beab0407cc7194b07cd3ca88ed0526e1a01c3",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "standard-teleport",
        "owningChunk": 2,
        "acceptance": [
          "Apply teleport semantics only to standard move with range bounded by movement budget"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_trample_cataphract",
    "sourceFingerprint": "b5100a5c0a43b3cf50887929409ad816c18ef58437733591404fa3f635846088",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "occupied-space-passage",
        "owningChunk": 2,
        "acceptance": [
          "Ignore engagement and pass through other characters without ending overlapped"
        ]
      },
      {
        "family": "transit-damage-counter",
        "owningChunk": 6,
        "acceptance": [
          "Deal tier kinetic transit damage once per turn with explicit target accounting"
        ]
      }
    ],
    "unresolved": [
      "Once-per-turn transit damage scope across multiple crossed targets needs explicit rule review."
    ]
  },
  {
    "lid": "npcf_transport_ship",
    "sourceFingerprint": "976c645d4c33b69eaba26f80ec73ae881b6ab69d9f4670bfe59cba168d8668fe",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Transport permits one Squad or strictly-smaller combined passenger Size"
        ]
      },
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Capacity check uses combined actual Size"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_transport_vehicle",
    "sourceFingerprint": "8ebc3fecc26f15b0d60e4122582b1d5b99e6df4220d70d30eede8316cecfce8c",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "passenger-capacity",
        "owningChunk": 2,
        "acceptance": [
          "Allow one Squad or combined passenger Size strictly below Vehicle Size"
        ]
      },
      {
        "family": "transport-state",
        "owningChunk": 6,
        "acceptance": [
          "Track passengers separately from independent turn actions"
        ]
      }
    ],
    "unresolved": [
      "Boarding disembarking position and passenger targeting rules absent from this record."
    ]
  },
  {
    "lid": "npcf_treads_or_hover_vehicle",
    "sourceFingerprint": "ba8790bd8df089f300366df36489c46766746bc10f8bc46d8301b338b0684e2d",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "difficult-terrain-exception",
        "owningChunk": 2,
        "acceptance": [
          "Ignore difficult terrain movement penalties"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_tripwires_seeder",
    "sourceFingerprint": "770730ab4b162632e25b124c0633b7efa970f3f354dde0bbe78b215797189d75",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Lay Mines gains recharge5"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Line3 tripwire footprint and closest-cell explosion origin"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Hostile entry/crossing triggers mine detonation"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_type_vehicle",
    "sourceFingerprint": "0215e0100d2d0aea0ebcedfdc1c5cfd55eeeb5895ba72614222d6a8b033f1ad2",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "vehicle-loadout",
        "owningChunk": 6,
        "acceptance": [
          "Permit one or more traits from Vehicle Traits list"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_ultra_systems_and_traits_ultra",
    "sourceFingerprint": "ef7d84228d0d152a5b704a4e40ecd1372dff86a9396ea85c6c6d2dc684c44ae1",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "template-option-count",
        "owningChunk": 6,
        "acceptance": [
          "Validate Ultra selection of one to three options from correct list"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_umbral_interdiction_hornet",
    "sourceFingerprint": "0dd601ee540b4fe55aa50ca2f5c05111d5c92528d3aad5335d4004b44fe09456",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "reaction-trigger-and-interruption",
        "owningChunk": 7,
        "acceptance": [
          "Once-round Sensors/LOS attempted-attack interrupt"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Native Systems check failure forces attack miss"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_undersize_squad",
    "sourceFingerprint": "211da46a4cb41abf9b6282d46fabdcf3daf4a7de22e340b3ad58813b74d38bfa",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "fixed-cover",
        "owningChunk": 6,
        "acceptance": [
          "Always provide soft cover and disallow hard cover"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_underslung_grenade_launcher_assault",
    "sourceFingerprint": "06e527c020fcbcbbcd768ac18059d9a5ba397a39bc3e2f42812b1640470f52ac",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "loading-arcing-blast",
        "owningChunk": 4,
        "acceptance": [
          "Validate range-8 Blast 2 and Arcing tier native Launcher attack"
        ]
      },
      {
        "family": "loading-state",
        "owningChunk": 2,
        "acceptance": [
          "Prevent reuse until authoritative reload"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_unique_physiology_monstrosity",
    "sourceFingerprint": "a960f9af38b359c5d292e3f86bc4871b857523488a08e6ecbc42045c3ba656e0",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Structure event uses alternative table and duration-specific conditions"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Native table roll/multiple-ones result; damage roll; conditional Hull save and destruction"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_unshielded_reactor_pyro",
    "sourceFingerprint": "42e55f3076d5a4993c8e5da0b6748fecffab5c6f9241f072e3e3b58114a0ce7b",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "adjacency-trigger-ledger",
        "owningChunk": 6,
        "acceptance": [
          "Track each character first adjacency on its own turn and turn-start adjacency"
        ]
      },
      {
        "family": "adjacency-heat",
        "owningChunk": 5,
        "acceptance": [
          "Apply tier heat once per relevant observed trigger"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_unstoppable_ultra",
    "sourceFingerprint": "ac645dd51172b342848908de3bb3670eb93137f135cefbdd4186d1c29b2ad6d8",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "involuntary-movement-immunity",
        "owningChunk": 6,
        "acceptance": [
          "Reject involuntary movement Knockback and Prone"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_veteran_human",
    "sourceFingerprint": "755bbe0c332418c993d8db6a21ee616616707d96d7f76678b08e25d1cd277373",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Tier HP bonus with null structured bonus must not duplicate actor stats"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_veteran_traits_veteran",
    "sourceFingerprint": "20b8b9f80af0876b4478c0f70bf8d5193b1b43e8849a887216fb9022d9a4a755",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "tier-loadout",
        "owningChunk": 6,
        "acceptance": [
          "Require Veteran Trait count equal tier"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_veterancy_veteran",
    "sourceFingerprint": "10ea0ad4e740f58d41efa40ed476cad734acf4e1cde8011403d417371275abf8",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "chosen-skill-accuracy",
        "owningChunk": 6,
        "acceptance": [
          "Persist creation-time chosen mech skill and add Accuracy to only matching checks and saves"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_vipers_speed_veteran",
    "sourceFingerprint": "32d95c22056da1720823ecedf5505bc27f85c294e7f452856b37e65a2c429854",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Veteran turn-priority override including PCs and narrative; only one owner uses each priority event"
        ]
      }
    ],
    "unresolved": [
      "Multiple eligible users need explicit choice/priority input; source gives no tie-break"
    ]
  },
  {
    "lid": "npcf_voice_of_authority_commander",
    "sourceFingerprint": "5c30a925767e6f6f40d7641f4f082dc5b06e1a1e5c5e270138f333159f66e6d2",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "failed-roll-reroll",
        "owningChunk": 7,
        "acceptance": [
          "Once per round after ally fails attack check or save while Commander not Jammed offer native reroll"
        ]
      },
      {
        "family": "roll-choice",
        "owningChunk": 5,
        "acceptance": [
          "Capture reroll result instead of inferring success"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_void_rend",
    "sourceFingerprint": "502c3418b4329d32f4cc8e447fbfaa80efda400bf2b749f8f129edefe522c81e",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "persistent-tear-zone",
        "owningChunk": 6,
        "acceptance": [
          "Place tear in adjacent free space without object obstruction or interaction"
        ]
      },
      {
        "family": "voluntary-battlefield-exit",
        "owningChunk": 5,
        "acceptance": [
          "Capture entering character choice and remove from battlefield through scene end"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve full action instead of two quick actions",
          "Block use until authoritative recharge confirms threshold: 6"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_volley_module_ultra",
    "sourceFingerprint": "aeaf872101bba921962b881db17584ccb26772e303da81bee26a44f4bf9e710b",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Full-action preparation followed by next-turn protocol; Loading exception"
        ]
      },
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Prepared-weapon multiattack against any eligible range targets excluding cover/Prone"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Target awareness and own-turn free Prone choice"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Persist weapon preparation and resume only on correct turn"
        ]
      }
    ],
    "unresolved": [
      "Unlimited attacks text versus any-number-of-characters target clause leaves repeated attacks on same target unresolved"
    ]
  },
  {
    "lid": "npcf_volley_rainmaker",
    "sourceFingerprint": "0daee096d4e7c3dbe9f50795cd363e27b0f9ef117132a884230ec441edfd30a9",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "full-recharge-budget",
        "owningChunk": 2,
        "acceptance": [
          "Charge full action and recharge5"
        ]
      },
      {
        "family": "multi-target-save-damage",
        "owningChunk": 5,
        "acceptance": [
          "Choose visible characters within20 capture Agility save tier damage half on success"
        ]
      }
    ],
    "unresolved": [
      "No explicit selected-target count cap; do not invent one."
    ]
  },
  {
    "lid": "npcf_vulnerable_to_tech_rpv",
    "sourceFingerprint": "e1585a02fbe68996b146e03314e9bb7079046095317ba4d2f7cafe5365c71742",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "hostile-tech-accuracy",
        "owningChunk": 6,
        "acceptance": [
          "Add Accuracy only to hostile tech actions against RPV"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_warp_sensors_mirage",
    "sourceFingerprint": "3deeab0689ee7553fe6aae24d880d23c77bb6d00a70ed55ea6ffd5cab18a4e95",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Quick-tech Sensors target"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Native tech success applies tier heat"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Target attacks treat all defenders as soft cover until target next-turn end"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_warp_targeting_mirage",
    "sourceFingerprint": "6f3ec17c0db6a5ca46a1fd096b1530bae93006bf9a89908e2631663f3d3a1df3",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "range-cover-aura",
        "owningChunk": 6,
        "acceptance": [
          "Provide soft cover to allies within50 suspend after Mirage damage until next-turn start"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_watchful_guardian_goliath",
    "sourceFingerprint": "26213cd5475a6573b0e095f4c410edd83fffee424d30f97060d09a01b5a436ac",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "cover-linked-resistance",
        "owningChunk": 6,
        "acceptance": [
          "Grant all-damage resistance only to allies currently benefiting from Goliath cover"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_weak_grunt",
    "sourceFingerprint": "7202a893341eb86adf1cece133d5a30e8f2efd78ddbbe623e9913fd7a17c25c4",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Structure/stress never exceed one; external heat immediately destroys"
        ]
      },
      {
        "family": "native-tech-save-effect-and-movement-resolution",
        "owningChunk": 5,
        "acceptance": [
          "Read heat source provenance before destruction; own system/weapon heat exempt"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_weakness_analyzer_specter",
    "sourceFingerprint": "56be5399dbaced85c2959273587c389d60be5cf1cf73f1061c76d4035ebc885b",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "hidden-turn-attack-bonus",
        "owningChunk": 6,
        "acceptance": [
          "Require turn begins Hidden and next attack remains Hidden then apply tier accuracy and critical1d6 bonus only once"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_weave_hornet",
    "sourceFingerprint": "aa0f8d35be8c76a56b568669835f3f013a91d62da0e62d805f5742bdac53cc93",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "first-reaction-attack-negation",
        "owningChunk": 6,
        "acceptance": [
          "First reaction attack against Hornet each round fails automatically, persist round consumption"
        ]
      },
      {
        "family": "reaction-event-accounting",
        "owningChunk": 7,
        "acceptance": [
          "Identify actual reaction attack and reject duplicate hook delivery"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_winged_monstrosity",
    "sourceFingerprint": "6625b09838bc71e1f8e146d0ea852e67764f2a4043448598ad4c9988a055c98c",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "budgets-footprints-and-use-legality",
        "owningChunk": 2,
        "acceptance": [
          "Flying movement and no forced landing at movement end"
        ]
      },
      {
        "family": "passive-modifier-timing-and-template-state",
        "owningChunk": 6,
        "acceptance": [
          "Passive persistent-flight permission"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_wolfhound_missile_ultra",
    "sourceFingerprint": "71307fa9311e51c5206b2da3cbdcd0e546ae9665ef49f24639d3f40fb50321a1",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "unresolved",
    "mechanics": [
      {
        "family": "quick-recharge-deployment",
        "owningChunk": 2,
        "acceptance": [
          "Charge quick action recharge6 select visible target within30 adjacent deployment and single active missile"
        ]
      },
      {
        "family": "guided-missile-timing",
        "owningChunk": 6,
        "acceptance": [
          "At owner turn start move3 or6 with target Lock On maneuver around obstacles and withhold recharge until detonation"
        ]
      },
      {
        "family": "collision-blast",
        "owningChunk": 4,
        "acceptance": [
          "Resolve Blast1 at first character collision or target arrival"
        ]
      },
      {
        "family": "missile-save-damage",
        "owningChunk": 5,
        "acceptance": [
          "Capture Agility saves and native tier Energy damage half on success"
        ]
      },
      {
        "family": "missile-stat-block",
        "owningChunk": 6,
        "acceptance": [
          "Create Size1 drone with tier HP10 15 20 Evasion10 EDefense10."
        ]
      }
    ],
    "unresolved": [
      "Equally direct path tie choices need authoritative choice."
    ]
  },
  {
    "lid": "npcf_wrath_lock_sentinel",
    "sourceFingerprint": "95f18c3bd41cc1d4068e83c35804c070c084d8b03c4c10d25ddd5d63f1981bba",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "armed-double-shot",
        "owningChunk": 4,
        "acceptance": [
          "After full-action arming make next Combat Shotgun attack twice"
        ]
      },
      {
        "family": "armed-state-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Consume armed state once, retain per-shot native receipts and stop after cancellation uncertainty"
        ]
      },
      {
        "family": "activation-resource-budget",
        "owningChunk": 2,
        "acceptance": [
          "Reserve full action instead of two quick actions"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_wrecker_industrial_mech",
    "sourceFingerprint": "d305ee300ac57b7ca4e0ba1d51085c40cbd4809b30b5e54d784382ebc782d07a",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "weapon-area-and-multiattack",
        "owningChunk": 4,
        "acceptance": [
          "Threat3 attacks include every character allied or hostile with tier stats"
        ]
      },
      {
        "family": "sequence-and-confirmed-result-continuation",
        "owningChunk": 3,
        "acceptance": [
          "Preserve complete target set and native outcomes"
        ]
      }
    ],
    "unresolved": []
  },
  {
    "lid": "npcf_xenotech_exotic",
    "sourceFingerprint": "dbb7a292214077e9547ce06912e7a361ec9b9b6db65a29436feac6afda8be72f",
    "sourceVersion": "3.1.3",
    "tiers": [
      1,
      2,
      3
    ],
    "classification": "reviewed",
    "mechanics": [
      {
        "family": "scan-information-restriction",
        "owningChunk": 6,
        "acceptance": [
          "Exclude Exotic Systems details from Scan results"
        ]
      }
    ],
    "unresolved": []
  }
];
